package com.garv.InternProject2.Controller;


import com.garv.InternProject2.Entity.User;
import com.garv.InternProject2.QueryRequest;
import com.garv.InternProject2.Repository.userRepo;
import com.garv.InternProject2.Service.QueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/query")
public class QueryController {
    @Autowired
    private QueryService queryService;

    @Autowired
    private userRepo userRepository;

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

}
