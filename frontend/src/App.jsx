import React, { useState } from 'react';

function App() {
  const [subjects, setSubjects] = useState('');
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = async () => {
    if (!subjects.trim()) {
      alert("Please enter at least one subject.");
      return;
    }

    setIsLoading(true);
    setStudyPlan(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjects: subjects.split(',').map(s => s.trim()) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudyPlan(data);
      } else {
        throw new Error(data.detail || "Failed to generate plan.");
      }
    } catch (error) {
      alert("Error: " + error.message + "\nCheck if backend terminal is running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>⚡ AI Smart Study Planner</h1>
      <p style={styles.subHeader}>Creative Matrix Dashboard Grid Layout</p>
      
      <div style={styles.inputGroup}>
        <input
          style={styles.input}
          type="text"
          placeholder="Subjects (e.g. Physics, Chemistry, Python)"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />
        <button 
          style={styles.button} 
          onClick={handleGeneratePlan} 
          disabled={isLoading}
        >
          {isLoading ? 'Structuring Matrix...' : 'Create Tabular Plan'}
        </button>
      </div>

      {studyPlan && studyPlan.timetable_data && (
        <div style={styles.dashboardContainer}>
          <div style={styles.metricsBar}>
            <h2 style={{ margin: 0 }}>📊 {studyPlan.schedule_title || "Weekly Matrix"}</h2>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
              Total Devoted Velocity: <strong>{studyPlan.total_hours} Hours</strong> this week
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.tableStyle}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Day</th>
                  <th style={styles.th}>Time Slot</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Core Topic</th>
                  <th style={styles.th}>Target Lessons / Tasks</th>
                </tr>
              </thead>
              <tbody>
                {studyPlan.timetable_data.map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}><strong>{row.day}</strong></td>
                    <td style={styles.td}>{row.time_slot}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{row.hours} Hrs</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.subjectText}>{row.subject}</span>
                    </td>
                    <td style={styles.td}><em>{row.topic}</em></td>
                    <td style={styles.td}>
                      <ul style={styles.list}>
                        {row.lessons.map((lesson, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{lesson}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, sans-serif' },
  header: { color: '#1a1a1a', marginBottom: '5px', textAlign: 'center', fontWeight: '800' },
  subHeader: { color: '#666', marginBottom: '30px', fontSize: '15px', textAlign: 'center' },
  inputGroup: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' },
  input: { padding: '14px', width: '450px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' },
  button: { padding: '14px 28px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },
  dashboardContainer: { marginTop: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e5e7eb' },
  metricsBar: { backgroundColor: '#1e1b4b', color: '#fff', padding: '20px', textAlign: 'left' },
  tableStyle: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', textAlign: 'left' },
  headerRow: { backgroundColor: '#4f46e5' },
  th: { padding: '16px', color: '#fff', fontWeight: '600', fontSize: '14px' },
  td: { padding: '16px', borderBottom: '1px solid #f3f4f6', color: '#374151', fontSize: '14px', verticalAlign: 'top' },
  evenRow: { backgroundColor: '#ffffff' },
  oddRow: { backgroundColor: '#f9fafb' },
  badge: { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '6px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', display: 'inline-block' },
  subjectText: { fontWeight: '700', color: '#111827', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' },
  list: { margin: '0', paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6' }
};

export default App;