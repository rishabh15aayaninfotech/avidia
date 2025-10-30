// components/tools/Templates.jsx
export default function Templates() {
  return (
    <div className="tool-container">
      <div className="templates-grid">
        <div className="template-card">
          <h3>Blog Post</h3>
          <p>Generate engaging blog posts on any topic</p>
          <button className="btn btn-primary">Use Template</button>
        </div>
        
        <div className="template-card">
          <h3>Email</h3>
          <p>Professional and casual email templates</p>
          <button className="btn btn-primary">Use Template</button>
        </div>
        
        <div className="template-card premium">
          <h3>Social Media</h3>
          <p>Captions and posts for social platforms</p>
          <button className="btn btn-primary">Use Template</button>
        </div>
      </div>
    </div>
  );
}



