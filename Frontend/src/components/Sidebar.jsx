import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, Table, Columns, ChevronRight, ChevronDown, Folder, Code, Server, Plug } from 'lucide-react';
import './Sidebar.css';

const TreeNode = ({ label, icon: Icon, children, onClick, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
    if (onClick) onClick();
  };

  return (
    <div className="tree-node">
      <div className="tree-node-label" onClick={handleToggle}>
        <span className="expander">
          {children ? (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="spacer" />}
        </span>
        <Icon size={14} className="node-icon" />
        <span className="node-text">{label}</span>
      </div>
      {expanded && children && <div className="tree-children">{children}</div>}
    </div>
  );
};

export default function Sidebar({ onSelectDb, activeDb, onInsertQuery }) {
  const { token } = useAuth();
  const [databases, setDatabases] = useState([]);
  const [tablesByDb, setTablesByDb] = useState({});
  const [columnsByTable, setColumnsByTable] = useState({});
  const [viewsByDb, setViewsByDb] = useState({});
  const [proceduresByDb, setProceduresByDb] = useState({});

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const res = await fetch('/api/data/my-access', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDatabases(data);
      }
    } catch (err) {
      console.error('Error fetching databases:', err);
    }
  };

  const fetchTables = async (dbId) => {
    if (tablesByDb[dbId]) return;
    try {
      const res = await fetch(`/api/schema/${dbId}/tables`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTablesByDb(prev => ({ ...prev, [dbId]: data }));
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  const fetchColumns = async (dbId, tableName) => {
    const key = `${dbId}-${tableName}`;
    if (columnsByTable[key]) return;
    try {
      const res = await fetch(`/api/schema/${dbId}/tables/${tableName}/columns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setColumnsByTable(prev => ({ ...prev, [key]: data }));
      }
    } catch (err) {
      console.error('Error fetching columns:', err);
    }
  };

  const fetchViews = async (dbId) => {
    if (viewsByDb[dbId]) return;
    try {
      const res = await fetch(`/api/schema/${dbId}/views`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setViewsByDb(prev => ({ ...prev, [dbId]: data }));
      }
    } catch (err) {
      console.error('Error fetching views:', err);
    }
  };

  const fetchProcedures = async (dbId) => {
    if (proceduresByDb[dbId]) return;
    try {
      const res = await fetch(`/api/schema/${dbId}/procedures`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProceduresByDb(prev => ({ ...prev, [dbId]: data }));
      }
    } catch (err) {
      console.error('Error fetching procedures:', err);
    }
  };

  const fetchProcedureDefinition = async (dbId, procName) => {
    try {
      const res = await fetch(`/api/schema/${dbId}/procedures/${procName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const text = await res.text();
        if (onInsertQuery) onInsertQuery(text);
      }
    } catch (err) {
      console.error('Error fetching procedure definition:', err);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Object Explorer
      </div>
      <div className="sidebar-toolbar">
        <button className="sidebar-btn" title="Connect">
          <Plug size={14} className="icon-green" /> Connect <ChevronDown size={12} />
        </button>
      </div>
      <div className="tree-container">
        <TreeNode label="localhost (SQL Server - admin)" icon={Server} defaultExpanded={true}>
          <TreeNode label="Databases" icon={Folder} defaultExpanded={true}>
            {databases.map(access => {
              const db = access.db;
              const isActive = (activeDb?.id || activeDb?.Id) === (db.id || db.Id);
              
              return (
                <div key={db.id || db.Id} className={`db-wrapper ${isActive ? 'active' : ''}`}>
                  <TreeNode 
                    label={db.dbName} 
                    icon={Database} 
                    onClick={() => {
                      onSelectDb(db);
                      const dbId = db.id || db.Id;
                      fetchTables(dbId);
                      fetchViews(dbId);
                      fetchProcedures(dbId);
                    }}
                  >
                    <TreeNode label="Tables" icon={Folder}>
                      {tablesByDb[db.id || db.Id]?.map(table => (
                        <TreeNode 
                          key={table} 
                          label={table} 
                          icon={Table}
                          onClick={() => fetchColumns(db.id || db.Id, table)}
                        >
                          <TreeNode label="Columns" icon={Folder}>
                            {columnsByTable[`${db.id || db.Id}-${table}`]?.map(col => (
                              <TreeNode key={col} label={col} icon={Columns} />
                            ))}
                          </TreeNode>
                        </TreeNode>
                      ))}
                    </TreeNode>
                    <TreeNode label="Views" icon={Folder}>
                      {viewsByDb[db.id || db.Id]?.map(view => (
                        <TreeNode key={view} label={view} icon={Table} />
                      ))}
                    </TreeNode>
                    <TreeNode label="Programmability" icon={Folder}>
                      <TreeNode label="Stored Procedures" icon={Folder}>
                        {proceduresByDb[db.id || db.Id]?.map(proc => (
                          <TreeNode key={proc} label={proc} icon={Code} onClick={() => fetchProcedureDefinition(db.id || db.Id, proc)} />
                        ))}
                      </TreeNode>
                    </TreeNode>
                  </TreeNode>
                </div>
              );
            })}
          </TreeNode>
          <TreeNode label="Security" icon={Folder} />
          <TreeNode label="Server Objects" icon={Folder} />
        </TreeNode>
      </div>
    </aside>
  );
}