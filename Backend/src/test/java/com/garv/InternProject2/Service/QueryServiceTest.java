package com.garv.InternProject2.Service;

import com.garv.InternProject2.Entity.Database;
import com.garv.InternProject2.Entity.UserDbAccess;
import com.garv.InternProject2.QueryRequest;
import com.garv.InternProject2.Repository.DatabaseRepo;
import com.garv.InternProject2.Repository.QueryLogRepository;
import com.garv.InternProject2.Repository.UserDbAccessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class QueryServiceTest {

    @Mock
    private UserDbAccessRepository userDbAccessRepository;

    @Mock
    private DatabaseRepo databaseRepository;

    @Mock
    private QueryLogRepository queryLogRepository;

    @InjectMocks
    private QueryService queryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testExecuteQueryNoAccess() {
        Long userId = 1L;
        QueryRequest request = new QueryRequest();
        request.setDbId(10L);
        request.setQuery("SELECT * FROM users");

        when(userDbAccessRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        String result = queryService.executeQuery(userId, request);

        assertEquals("Access denied. You do not have access to this database.", result);
        verify(queryLogRepository, times(1)).save(any());
    }

    @Test
    void testExecuteQueryReadAccessBlocksDrop() {
        Long userId = 1L;
        QueryRequest request = new QueryRequest();
        request.setDbId(10L);
        request.setQuery("DROP TABLE users");

        Database db = new Database();
        db.setId(10L);
        db.setDbName("test_db");

        UserDbAccess access = new UserDbAccess();
        access.setDb(db);
        access.setRight(UserDbAccess.Permission.READ);

        when(userDbAccessRepository.findByUserId(userId)).thenReturn(Collections.singletonList(access));

        String result = queryService.executeQuery(userId, request);

        assertEquals("Access denied. You only have READ access — only SELECT, SHOW, and EXPLAIN queries allowed.", result);
        verify(queryLogRepository, times(1)).save(any());
    }

    @Test
    void testExecuteQueryWriteAccessBlocksDrop() {
        Long userId = 1L;
        QueryRequest request = new QueryRequest();
        request.setDbId(10L);
        request.setQuery("DROP TABLE users");

        Database db = new Database();
        db.setId(10L);
        db.setDbName("test_db");

        UserDbAccess access = new UserDbAccess();
        access.setDb(db);
        access.setRight(UserDbAccess.Permission.WRITE);

        when(userDbAccessRepository.findByUserId(userId)).thenReturn(Collections.singletonList(access));

        String result = queryService.executeQuery(userId, request);

        assertEquals("Access denied. WRITE access does not allow DDL queries.", result);
        verify(queryLogRepository, times(1)).save(any());
    }

    @Test
    void testExecuteQueryWriteAccessBlocksDeleteWithoutWhere() {
        Long userId = 1L;
        QueryRequest request = new QueryRequest();
        request.setDbId(10L);
        request.setQuery("DELETE FROM users");

        Database db = new Database();
        db.setId(10L);
        db.setDbName("test_db");

        UserDbAccess access = new UserDbAccess();
        access.setDb(db);
        access.setRight(UserDbAccess.Permission.WRITE);

        when(userDbAccessRepository.findByUserId(userId)).thenReturn(Collections.singletonList(access));

        String result = queryService.executeQuery(userId, request);

        assertEquals("Access denied. DELETE, UPDATE, TRUNCATE require a WHERE clause for WRITE access.", result);
        verify(queryLogRepository, times(1)).save(any());
    }
}
