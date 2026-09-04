package com.garv.InternProject2.Controller;


import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.NlQueryRequest;
import com.garv.InternProject2.QueryRequest;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Service.GeminiService;
import com.garv.InternProject2.Service.QueryService;
import com.garv.InternProject2.Service.SchemaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.garv.InternProject2.Entity.QueryLog;
import com.garv.InternProject2.Repository.QueryLogRepository;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("api/query")
public class QueryController {
    @Autowired
    private QueryService queryService;

    @Autowired
    private userRepo userRepository;

    @Autowired
    private QueryLogRepository queryLogRepository;

    @Autowired
    private com.garv.InternProject2.Repository.UserDbAccessRepository userDbAccessRepository;

    @GetMapping("/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> getHistory(HttpServletRequest httprequest) {
        String username = (String)httprequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if(user == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<com.garv.InternProject2.Entity.UserDbAccess> accessList = userDbAccessRepository.findByUserId(user.getId());
        List<Long> dbIds = accessList.stream().map(a -> a.getDb().getId()).toList();
        
        if (dbIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        List<QueryLog> logs = queryLogRepository.findByDbidInOrderByCreatedAtDesc(dbIds);
        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        
        java.util.Map<Long, String> userCache = new java.util.HashMap<>();
        
        for (QueryLog log : logs) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", log.getId());
            map.put("dbname", log.getDbname());
            map.put("status", log.getStatus());
            map.put("createdAt", log.getCreatedAt());
            map.put("querytext", log.getQuerytext());
            map.put("actiontype", log.getActiontype());
            
            String executingUser = userCache.get(log.getUserid());
            if (executingUser == null) {
                User u = userRepository.findById(log.getUserid()).orElse(null);
                executingUser = (u != null) ? u.getUsername() : "Unknown User";
                userCache.put(log.getUserid(), executingUser);
            }
            map.put("username", executingUser);
            
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/execute")
    public ResponseEntity<String> executeQuery(@Valid @RequestBody QueryRequest request, HttpServletRequest httprequest) {
        String username= (String)httprequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if(user==null)
        {
            return ResponseEntity.status(401).body("Username not found");
        }
        return ResponseEntity.ok(queryService.executeQuery(user.getId(), request));

    }
    @PostMapping("/procedure/create")
    public ResponseEntity<String> createProcedure(@Valid @RequestBody QueryRequest request, HttpServletRequest httprequest){
        String username =(String)httprequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if(user==null)
        {
            return ResponseEntity.status(401).body("Username not found");
        }
        return ResponseEntity.ok(queryService.createProcedure(user.getId(),request));
    }

    @PostMapping("/procedure/call")
    public ResponseEntity<String> callProcedure(@Valid @RequestBody QueryRequest request, HttpServletRequest httprequest){
        String username =(String)httprequest.getAttribute("username");
        User user = userRepository.findByUsername(username).orElse(null);
        if(user==null)
        {
            return ResponseEntity.status(401).body("Username not found");
        }
        return ResponseEntity.ok(queryService.callProcedure(user.getId(),request));
    }
    @Autowired
    SchemaService schemaService;

    @Autowired
    GeminiService geminiService;

    @PostMapping("/ai-execute")
    public ResponseEntity<String> aiExecuteQuery( @Valid @RequestBody NlQueryRequest nlrequest, HttpServletRequest httpRequest){
        String username= (String)httpRequest.getAttribute("username");
        User user= userRepository.findByUsername(username).orElse(null);
        if(user==null) return ResponseEntity.status(401).body("username not found");

        List<String> tables= schemaService.getTables(user.getId(), nlrequest.getDbId());
        StringBuilder schemaContext= new StringBuilder();

        for(String table:tables){
            List<String> columns = schemaService.getColumns(user.getId(), nlrequest.getDbId(), table);
            schemaContext.append("Table: ").append(table).append(" (");
            schemaContext.append(String.join(", ", columns));
            schemaContext.append(")\n");
        }
        String generatedSql=geminiService.generateSql(schemaContext.toString(), nlrequest.getQuestion());
        if(generatedSql.startsWith("ERROR")){
            return ResponseEntity.status(500).body(generatedSql);
        }
        QueryRequest queryRequest= new QueryRequest();
        queryRequest.setDbId(nlrequest.getDbId());
        queryRequest.setQuery(generatedSql);
        String result=queryService.executeQuery(user.getId(),queryRequest);
        return ResponseEntity.ok("Generated SQl"+generatedSql+"\n\nResult:\n"+result);
    }

}
