package com.garv.InternProject2.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateSql(String schemaContext, String question) {

        String prompt = "You are a MySQL SQL generator. Given this schema:\n" +
                schemaContext +
                "\n\nConvert this question into a single valid MySQL query. " +
                "Return ONLY the raw SQL query, no explanation, no markdown formatting, no backticks.\n" +
                "Question: " + question;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        Map response = restTemplate.postForObject(apiUrl, entity, Map.class);

        try {
            List<Map> candidates = (List<Map>) response.get("candidates");
            Map content = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            String sql = (String) parts.get(0).get("text");
            return sql.trim();
        } catch (Exception e) {
            return "ERROR: Could not parse Gemini response - " + e.getMessage();
        }
    }
}