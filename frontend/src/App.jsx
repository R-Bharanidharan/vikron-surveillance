import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Shield, ShieldAlert, History, User, Users, Activity, 
  Download, Bell, RefreshCw, Layers, Home, Info, Cpu, Network, 
  CheckCircle, Zap, Mail, Rocket, ExternalLink, ChevronRight,
  Target, Eye, Search, AlertTriangle, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const BACKEND_URL = "http://localhost:8001";
const API_BASE = `${BACKEND_URL}/api`;
const WS_URL = "ws://localhost:8001/api/ws";

// --- Framer Motion Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

// --- Sub-Components for Pages ---

const HomePage = ({ onLaunch, onDoc, darkMode }) => (
  <motion.div className="page-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="hero">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="status-badge" 
        style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', margin: '0 auto' }}
      >
        <Fingerprint size={14} /> Neural Identification Active
      </motion.div>
      <h1 className="hero-h1" style={{ 
        fontSize: '5.5rem', 
        letterSpacing: '-0.04em', 
        background: darkMode 
          ? 'linear-gradient(to bottom, #fff 30%, var(--accent-secondary) 100%)' 
          : 'linear-gradient(to bottom, #0f172a 30%, var(--accent-secondary) 100%)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent' 
      }}>
        VIKRON
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', fontWeight: 400, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Neural Identification Elite
      </h2>
      <p className="hero-p" style={{ maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--text-secondary)' }}>
        Step into the sanctuary of intelligent surveillance. VIKRON masterfully orchestrates 
        deep neural networks and hardware precision to deliver an unparalleled security experience.
      </p>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={onLaunch} style={{ padding: '1rem 2.5rem', fontSize: '1rem', background: 'var(--accent-secondary)', color: darkMode ? '#000' : '#fff' }}>
          Initialize Hub
        </button>
        <button 
          className="btn" 
          onClick={onDoc} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            borderBottom: '1px solid var(--accent-secondary)',
            borderRadius: 0,
            padding: '0.5rem 0',
            color: 'var(--accent-secondary)'
          }}
        >
          Explore Methodology <ChevronRight size={16} />
        </button>
      </div>
    </div>

    <section>
      <h2 className="section-h2"><Activity color="var(--accent-primary)" /> Network Capabilities</h2>
      <div className="feature-grid">
        {[
          { title: "Neural Recognition", desc: "Advanced FaceNet embeddings for ultra-precise student matching.", icon: Target },
          { title: "Dual-Node Stream", desc: "Synchronized MJPEG ingestion from multiple ESP32-CAM sensors.", icon: Eye },
          { title: "Real-time Hub", desc: "Low-latency WebSocket integration for instant visual feedback.", icon: Zap },
          { title: "Secure Database", desc: "Persistent SQLAlchemy storage for all detected biometric events.", icon: Shield },
          { title: "Cyber Metrics", desc: "Detailed confidence and similarity analysis for every scan.", icon: Search },
          { title: "Dynamic Logic", desc: "Asynchronous Python backend built for maximum concurrency.", icon: Cpu }
        ].map((item, i) => (
          <motion.div 
            key={i} 
            variants={cardVariants}
            className="glass-card feature-item"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <item.icon size={28} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  </motion.div>
);

const AboutPage = () => (
  <motion.div className="page-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="section-header" style={{ marginBottom: '3rem' }}>
      <h1 className="hero-h1" style={{ textAlign: 'left', fontSize: '3.5rem', marginBottom: '0.5rem' }}>The Genesis of VIKRON</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Forged at the intersection of biometrics and edge computing.</p>
    </div>
    
    <section style={{ marginBottom: '4rem' }}>
      <div className="glass-card royal-card" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03 }}>
          <Shield size={400} />
        </div>
        <h2 className="section-h2" style={{ marginTop: 0 }}><Rocket color="var(--accent-secondary)" /> Mission Excellence</h2>
        <p className="hero-p" style={{ textAlign: 'left', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '800px' }}>
          VIKRON represents a pinnacle of campus security innovation. By synthesizing **MTCNN's** multi-stage detection 
          rigor with **FaceNet's** 128-dimensional embedding precision, we've eliminated the friction of manual attendance 
          and traditional identification, replacing it with a seamless neural handshake.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginTop: '3rem' }}>
          {[
            { label: "Optical Ingestion", desc: "Real-time BGR frame acquisition via ESP32-CAM AI-Thinker nodes at 30 FPS." },
            { label: "Landmark Refinement", desc: "Spatial localization of facial nodes using 3-stage P-Net, R-Net, and O-Net." },
            { label: "Neural Signature", desc: "InceptionResnetV1 extraction of invariant biometric features in hyperspace." },
            { label: "Identity Appraisal", desc: "Real-time Cosine Similarity mapping against the SECE Student Registry." }
          ].map((step, i) => (
            <motion.div key={i} whileHover={{ y: -5 }}>
              <div style={{ borderBottom: '2px solid var(--accent-secondary)', width: '40px', marginBottom: '1rem', opacity: 0.5 }}></div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Phase 0{i+1}</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.75rem' }}>{step.label}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </motion.div>
);

const TechStackPage = () => (
  <motion.div className="page-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="section-header" style={{ marginBottom: '3rem' }}>
      <h1 className="hero-h1" style={{ textAlign: 'left', fontSize: '3.5rem', marginBottom: '0.5rem' }}>Neural Architecture</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>The engineering pillars supporting the VIKRON ecosystem.</p>
    </div>
    
    <div className="feature-grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
      {[
        { 
          cat: "Edge Node (Hardware)", 
          icon: Cpu,
          color: "var(--accent-secondary)",
          items: ["ESP32-CAM (AI-Thinker Model)", "OV2640 Optical Sensor (320x240)", "Wi-Fi Dual-Stream Ingestion", "HTTP/MJPEG Stream Pipeline"]
        },
        { 
          cat: "Inference Engine (AI)", 
          icon: Target,
          color: "var(--accent-primary)",
          items: ["InceptionResnetV1 (FaceNet Backbone)", "MTCNN Detection (Triple-Refine)", "Cosine Similarity Evaluation", "PyTorch 2.0 Backend Core"]
        },
        { 
          cat: "Management Layer (Full-Stack)", 
          icon: Layers,
          color: "var(--accent-success)",
          items: ["React 19 Dashboard (Vite)", "FastAPI Asynchronous Gateway", "Websocket Full-Duplex Link", "SQLAlchemy + SQLite Persistent DB"]
        }
      ].map((stack, i) => (
        <motion.div key={i} className="glass-card royal-card" style={{ padding: '2.5rem' }} whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: `1px solid ${stack.color}44` }}>
              <stack.icon color={stack.color} size={28} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stack.cat}</h3>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {stack.items.map((item, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                <CheckCircle size={16} color={stack.color} /> {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const TeamPage = ({ teamPhotos }) => (
  <motion.div className="page-content" variants={pageVariants} initial="initial" animate="animate" exit="exit">
    <div className="section-header" style={{ marginBottom: '3rem' }}>
      <h1 className="hero-h1" style={{ textAlign: 'left', fontSize: '3.5rem', marginBottom: '0.5rem' }}>Innovation Leaders</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>The minds behind the neural architecture and cyber-physical integration.</p>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', marginTop: '2rem' }}>
      {[
        { 
          name: "Bharanidharan R", 
          roll: "23EC017",
          role: "AI & Systems Lead", 
          bio: "Architect of the neural identification pipeline and hardware integration logic. Expert in Edge AI and embedded optimization.", 
          color: "var(--accent-primary)",
          photo: null,   // show initials
          initials: "BR",
          email: "bharanidharan.r2023ece@sece.ac.in",
          phone: "9750719212"
        },
        { 
          name: "Indhu M", 
          roll: "23EC046",
          role: "UX & Frontend Lead", 
          bio: "Lead designer of the Cyber-Premium dashboard and real-time visualization layer. Specialist in high-performance React architectures.", 
          color: "var(--accent-secondary)",
          photo: teamPhotos["23EC046"] || null,
          initials: "IM",
          email: "indhu.m2023ece@sece.ac.in",
          phone: "9487865918"
        }
      ].map((member, i) => (
        <motion.div 
          key={member.name} 
          className="glass-card team-card"
          whileHover={{ y: -10, borderColor: member.color }}
          style={{ padding: '0', overflow: 'hidden', position: 'relative' }}
        >
          <div style={{ 
            padding: '2.5rem 2rem 1.5rem', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${member.color}18 0%, transparent 60%)`
          }}>
            {/* Avatar: photo or styled initials */}
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: `3px solid ${member.color}`,
              boxShadow: `0 0 30px ${member.color}44, 0 0 0 6px ${member.color}18`,
              flexShrink: 0,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: member.photo ? 'transparent' : `linear-gradient(135deg, ${member.color}33, ${member.color}88)`
            }}>
              {member.photo ? (
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                  onError={(e) => {
                    // On error fall back to initials by hiding img and showing parent bg
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<span style="font-family:Outfit,sans-serif;font-size:2.2rem;font-weight:900;color:white;letter-spacing:-2px">${member.initials}</span>`;
                  }}
                />
              ) : (
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 900, color: 'white', letterSpacing: '-2px' }}>
                  {member.initials}
                </span>
              )}
            </div>
          </div>
          <div style={{ padding: '2rem', paddingTop: '0.5rem' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>{member.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ color: member.color, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>{member.role}</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-dim)' }}></span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{member.roll}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{member.bio}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href={`mailto:${member.email}`} className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer', textDecoration: 'none', color: 'inherit', textTransform: 'none' }}>
                  <Mail size={14} color={member.color} /> {member.email}
                </a>
                <div className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', textTransform: 'none' }}>
                  <Zap size={14} color={member.color} /> {member.phone}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// --- Dashboard Component ---

const Dashboard = ({ latestDetection, logs, personCards, cameraStatus, fetchData, exportCSV }) => (
  <motion.main 
    className="dashboard-grid"
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {/* Left Side: Cameras */}
    <section className="cameras-section">
      {[1, 2].map(id => {
        const cam = cameraStatus.find(s => s.camera_id === `Camera ${id}`);
        const status = cam?.status || "Offline";
        return (
          <div key={id} className={`camera-container glass ${status === "Offline" ? 'is-offline' : ''}`}>
            {status !== "Offline" ? (
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={`${API_BASE}/video_feed/${id}`} 
                className="camera-feed"
                alt={`Camera ${id}`}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', color: 'var(--text-dim)' }}>
                <Camera size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p className="font-heading" style={{ fontSize: '0.9rem', letterSpacing: '0.2em' }}>SIGNAL LOST</p>
              </div>
            )}
            <div className="camera-overlay">
              <div className="status-badge" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <Eye size={12} /> Live stream: {id}
              </div>
              <div className={cn("status-badge", status === "Online" ? 'status-online' : (status === "Mocking" ? 'status-mocking' : 'status-offline'))}>
                <div className="status-dot"></div>
                {status}
              </div>
            </div>
          </div>
        );
      })}
    </section>

    {/* Right Side: Details & Logs */}
    <section className="info-section">
      <div className="glass-card panel">
        <h3 className="panel-title">Neural Output</h3>
        <AnimatePresence mode="wait">
          {latestDetection ? (
            <motion.div 
              key={latestDetection.id || latestDetection.timestamp}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="detection-card"
            >
              <div className="portrait-frame">
                {(latestDetection.photo_path || latestDetection.snapshot_path) ? (
                  <img 
                    src={`${BACKEND_URL}${latestDetection.photo_path || latestDetection.snapshot_path}`} 
                    className="portrait-img" 
                    alt="Detection" 
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={40} color="var(--border-glass)" />
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-name">{latestDetection.name}</div>
                <div className="profile-id">{latestDetection.roll_no}</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Camera size={12} /> {latestDetection.camera}</span>
                  <span>{latestDetection.timestamp.split(' ')[1]}</span>
                </div>
                {/* Confidence Glow Bar */}
                <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${latestDetection.confidence * 100}%` }}
                    style={{ 
                      height: '100%', 
                      background: latestDetection.status === "Authorized" ? "var(--accent-success)" : "var(--accent-danger)",
                      boxShadow: `0 0 10px ${latestDetection.status === "Authorized" ? "var(--accent-success)" : "var(--accent-danger)"}`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Waiting for biometric events...
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card panel" style={{ flex: 1 }}>
        <h3 className="panel-title">Activity Stream</h3>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <table className="activity-table">
            <thead>
              <tr>
                <th>IDENTIFIER</th>
                <th>IDENTITY</th>
                <th>TIMESTAMP</th>
                <th>RESULT</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id || idx} className="row-fade">
                  <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{log.roll_no}</td>
                  <td style={{ fontWeight: 600 }}>{log.name}</td>
                  <td style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{log.timestamp.split(' ')[1]}</td>
                  <td>
                    <span style={{ 
                      color: log.status === "Authorized" ? 'var(--accent-success)' : 'var(--accent-danger)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card panel">
        <h3 className="panel-title">Biometric Inventory</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {personCards.slice(0, 6).map((p, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px', 
                border: '1px solid var(--border-glass)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.3)' }}>
                {p.photo_path ? (
                  <img src={`${BACKEND_URL}${p.photo_path}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="var(--text-dim)" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{p.roll_no}</div>
              </div>
              <div style={{ 
                fontSize: '0.6rem', 
                padding: '0.2rem 0.5rem',
                borderRadius: '99px',
                fontWeight: 700,
                background: p.status === 'Authorized' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: p.status === 'Authorized' ? 'var(--accent-success)' : 'var(--accent-danger)',
                flexShrink: 0
              }}>
                {p.status === 'Authorized' ? 'AUTH' : 'UNK'}
              </div>
            </motion.div>
          ))}
          {personCards.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>No records yet</div>
          )}
        </div>
      </div>
    </section>
  </motion.main>
);

// --- Main App ---

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [latestDetection, setLatestDetection] = useState(null);
  const [logs, setLogs] = useState([]);
  const [personCards, setPersonCards] = useState([]);
  const [cameraStatus, setCameraStatus] = useState([
    { camera_id: "Camera 1", status: "Offline" },
    { camera_id: "Camera 2", status: "Offline" }
  ]);
  const [alert, setAlert] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [teamPhotos, setTeamPhotos] = useState({});

  // Apply theme to the entire document root so body, scrollbar, etc. all respond
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [darkMode]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "System Online", time: "Just now", type: "info" },
    { id: 2, title: "Camera 1 Synced", time: "2 mins ago", type: "success" },
  ]);
  const ws = useRef(null);

  useEffect(() => {
    fetchData();
    connectWS();
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  const fetchData = async () => {
    try {
      const logsRes = await fetch(`${API_BASE}/detection_logs?limit=20`);
      setLogs(await logsRes.json());
      const cardsRes = await fetch(`${API_BASE}/person_cards`);
      setPersonCards(await cardsRes.json());
      const statusRes = await fetch(`${API_BASE}/camera_status`);
      setCameraStatus(await statusRes.json());
      
      // Fetch specifically for team
      const fetchTeamPhoto = async (roll) => {
        try {
          const res = await fetch(`${API_BASE}/student_photo/${roll}`);
          const data = await res.json();
          if (data.photo_url) {
            setTeamPhotos(prev => ({ ...prev, [roll]: `${BACKEND_URL}${data.photo_url}` }));
          }
        } catch (e) { console.error(e); }
      };
      fetchTeamPhoto("23EC017");
      fetchTeamPhoto("23EC046");
    } catch (err) { console.error(err); }
  };

  const connectWS = () => {
    ws.current = new WebSocket(WS_URL);
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.event === "new_detection") {
        const detection = message.data;
        setLatestDetection(detection);
        setLogs(prev => [detection, ...prev.slice(0, 19)]);
        updatePersonCards(detection);
        if (detection.status === "Unknown") {
          setAlert(detection);
          setNotifications(prev => [{
            id: Date.now(),
            title: `Unknown Profile: ${detection.camera}`,
            time: "Live",
            type: "danger"
          }, ...prev.slice(0, 4)]);
          setTimeout(() => setAlert(null), 5000);
        }
      } else if (message.event === "camera_status") {
        setCameraStatus(message.data);
      }
    };
    ws.current.onclose = () => setTimeout(connectWS, 3000);
  };

  const updatePersonCards = (detection) => {
    setPersonCards(prev => {
      const exists = prev.find(p => p.roll_no === detection.roll_no);
      if (exists) {
        return prev.map(p => p.roll_no === detection.roll_no ? {
          ...p,
          latest_detection_time: detection.timestamp,
          camera: detection.camera,
          photo_path: detection.snapshot_path || p.photo_path
        } : p);
      } else {
        return [{
          roll_no: detection.roll_no,
          name: detection.name,
          latest_detection_time: detection.timestamp,
          camera: detection.camera,
          status: detection.status,
          photo_path: detection.snapshot_path,
          dob: detection.dob
        }, ...prev];
      }
    });
  };

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Roll Number", "Name", "Camera", "Time", "Status"];
    const csvRows = [headers.join(",")];
    logs.forEach(l => csvRows.push([l.roll_no, l.name, l.camera, l.timestamp, l.status].join(",")));
    const url = window.URL.createObjectURL(new Blob([csvRows.join("\n")], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_logs_${Date.now()}.csv`;
    a.click();
  };

  const renderPage = () => {
    return (
      <AnimatePresence mode="wait">
        {currentPage === 'home' && (
          <HomePage 
            key="home" 
            onLaunch={() => setCurrentPage('dashboard')} 
            onDoc={() => setCurrentPage('tech')}
            darkMode={darkMode}
          />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            latestDetection={latestDetection} 
            logs={logs} 
            personCards={personCards} 
            cameraStatus={cameraStatus}
            fetchData={fetchData}
            exportCSV={exportCSV}
          />
        )}
        {currentPage === 'about' && <AboutPage key="about" />}
        {currentPage === 'tech' && <TechStackPage key="tech" />}
        {currentPage === 'team' && <TeamPage key="team" teamPhotos={teamPhotos} />}
      </AnimatePresence>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <nav className="sidebar glass">
        <motion.div 
          className="brand"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setCurrentPage('home')}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ width: '44px', height: '44px', background: 'transparent', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VIKRON Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 className="brand-title">VIKRON</h2>
        </motion.div>
        
        <div className="nav-links">
          {[
            { id: 'home', label: 'Overview', icon: Home },
            { id: 'dashboard', label: 'Monitor Hub', icon: Activity },
            { id: 'about', label: 'Core Vision', icon: Target },
            { id: 'tech', label: 'Neural Stack', icon: Cpu },
            { id: 'team', label: 'Architects', icon: Users },
          ].map(item => (
            <motion.div 
              key={item.id} 
              className={cn("nav-item", currentPage === item.id && "active")}
              onClick={() => setCurrentPage(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon size={20} />
              {item.label}
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.75rem' }}>CORE STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <div className="status-dot" style={{ background: 'var(--accent-success)', boxShadow: '0 0 10px var(--accent-success)' }}></div>
            NEURAL LINK OK
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="header" style={{ position: 'relative' }}>
          <div className="page-title">{currentPage.toUpperCase()}</div>
          <div className="header-controls">
            <motion.button 
              className="btn btn-secondary theme-toggle" 
              style={{ padding: '0.6rem', gap: '0.5rem', fontSize: '0.8rem' }} 
              onClick={() => setDarkMode(!darkMode)}
              whileTap={{ scale: 0.9 }}
            >
              <span style={{ fontSize: '1rem' }}>{darkMode ? '☀️' : '🌙'}</span>
              {darkMode ? 'Light' : 'Dark'}
            </motion.button>
            {currentPage === 'dashboard' && (
              <>
                <button className="btn btn-secondary" onClick={fetchData}><RefreshCw size={16} /> Sync</button>
                <button className="btn btn-primary" onClick={exportCSV}><Download size={16} /> Export</button>
              </>
            )}
            <div 
              className="status-badge" 
              style={{ padding: '0.5rem', cursor: 'pointer', position: 'relative' }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} color={notifications.some(n => n.type === 'danger') ? 'var(--accent-danger)' : 'white'} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--accent-danger)', borderRadius: '50%' }}></span>
              )}
            </div>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="glass"
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    width: '300px', 
                    padding: '1.25rem', 
                    marginTop: '0.5rem',
                    zIndex: 1000,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}>NOTIFICATIONS</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setNotifications([])}>Clear all</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                        <div style={{ width: '4px', height: '1.5rem', borderRadius: '2px', background: `var(--accent-${n.type || 'primary'})` }}></div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{n.time}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>No new events</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {renderPage()}
      </div>

      {/* Cyber Alert Popup */}
      <AnimatePresence>
        {alert && (
          <motion.div 
            className="cyber-alert"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <AlertTriangle color="var(--accent-danger)" size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', letterSpacing: '-0.02em' }}>THREAT DETECTED</div>
              <div style={{ fontSize: '0.8rem', color: '#fca5a5' }}>Unidentified profile on {alert.camera}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
