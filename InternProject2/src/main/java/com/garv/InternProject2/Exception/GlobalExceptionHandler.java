package com.garv.InternProject2.Exception;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import java.util.HashMap;
import java.util.Map;
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map <String, String>> handleValidationErrors(MethodArgumentNotValidException e)
    {
        Map<String,String> errors = new HashMap<>();

        for(FieldError error:e.getBindingResult().getFieldErrors())
        {
            String field=error.getField();
            String msg=error.getDefaultMessage();
            errors.put(field,msg);
        }
        return ResponseEntity.badRequest().body(errors);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleGenericErrors(Exception e)
    {
        Map<String,String> error = new HashMap<>();
        error.put("error",e.getMessage());
    return ResponseEntity.status(500).body(error);
    }

}
