import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, Table, Columns, ChevronRight, ChevronDown, Folder, Code } from 'lucide-react';
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

export default function Sidebar({ onSelectDb, activeDb }) {
  const { token } = useAuth();
  const [databases, setDatabases] = useState([]);
  const [tablesByDb, setTablesByDb] = useState({});
  const [columnsByTable, setColumnsByTable] = useState({});

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

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Object Explorer
      </div>
      <div className="tree-container">
        {databases.map(access => {
          const db = access.db;
          const isActive = activeDb?.id === db.id;
          
          return (
            <div key={db.id} className={`db-wrapper ${isActive ? 'active' : ''}`}>
              <TreeNode 
                label={db.dbName} 
                icon={Database} 
                onClick={() => {
                  onSelectDb(db);
                  fetchTables(db.id);
                }}
              >
                <TreeNode label="Tables" icon={Folder}>
                  {tablesByDb[db.id]?.map(table => (
                    <TreeNode 
                      key={table} 
                      label={table} 
                      icon={Table}
                      onClick={() => fetchColumns(db.id, table)}
                    >
                      {columnsByTable[`${db.id}-${table}`]?.map(col => (
                        <TreeNode key={col} label={col} icon={Columns} />
                      ))}
                    </TreeNode>
                  ))}
                </TreeNode>
                <TreeNode label="Views" icon={Folder} />
                <TreeNode label="Stored Procedures" icon={Code} />
              </TreeNode>
            </div>
          );
        })}
      </div>
    </aside>
  );
}