// src/App.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PreviewEditbar from './components/PreviewEditbar';
import PreviewEditor from './components/PreviewEditor';
import RenderPreview from './components/RenderPreview';
import UploadCV from './components/UploadCV';
import AIToolbar from './components/AIToolbar';
import agentAPI from './services/agentAPI';
import './tailwind.css';

const App = () => {
  const [resumeData, setResumeData] = useState(null); // 改为存储JSON对象
  const [editContent, setEditContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [config, setConfig] = useState({ font: 'SimSun', fontSize: 12, lineHeight: 1.5 });
  const [showUploadCV, setShowUploadCV] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 处理上传的简历数据
  const handleUpload = (data) => {
    setResumeData(data);
    // 将JSON数据转换为Markdown格式显示
    const markdownContent = convertJsonToMarkdown(data);
    setEditContent(markdownContent);
    setPreviewContent(markdownContent);
    setShowUploadCV(false);
  };

  // 将JSON数据转换为Markdown格式
  const convertJsonToMarkdown = (data) => {
    let markdown = '';
    
    if (data.user_name) {
      markdown += `# ${data.user_name}\n\n`;
    }
    //具体转换逻辑
    // 基本信息
    markdown += `## 基本信息\n\n`;
    if (data.user_contact_info?.phone) markdown += `- 电话：${data.user_contact_info.phone}\n`;
    if (data.user_contact_info?.email) markdown += `- 邮箱：${data.user_contact_info.email}\n`;
    if (data.user_location) markdown += `- 地址：${data.user_location}\n`;
    if (data.user_target) markdown += `- 求职目标：${data.user_target}\n`;
    markdown += `\n`;
    
    // 教育背景
    if (data.user_education && data.user_education.length > 0) {
      markdown += `## 教育背景\n\n`;
      data.user_education.forEach((edu, index) => {
        if (edu.user_university) markdown += `**学校：** ${edu.user_university}\n\n`;
        if (edu.user_major) markdown += `**专业：** ${edu.user_major}\n\n`;
        if (edu.degree) markdown += `**学位：** ${edu.degree}\n\n`;
        if (edu.dates) markdown += `**时间：** ${edu.dates}\n\n`;
        if (edu.user_grade) markdown += `**年级：** ${edu.user_grade}\n\n`;
        if (edu.user_graduate_year) markdown += `**毕业年份：** ${edu.user_graduate_year}\n\n`;
        if (edu.user_gpa) markdown += `**GPA：** ${edu.user_gpa}\n\n`;
        if (edu.user_language_score) markdown += `**语言成绩：** ${edu.user_language_score}\n\n`;
        if (edu.details) markdown += `**详细信息：** ${edu.details}\n\n`;
        if (index < data.user_education.length - 1) markdown += `---\n\n`;
      });
    }
    
    // 实习经历
    if (data.internship_experience && data.internship_experience.length > 0) {
      markdown += `## 实习经历\n\n`;
      data.internship_experience.forEach((internship, index) => {
        if (internship.company) markdown += `**公司：** ${internship.company}\n\n`;
        if (internship.role) markdown += `**职位：** ${internship.role}\n\n`;
        if (internship.location) markdown += `**地点：** ${internship.location}\n\n`;
        if (internship.dates) markdown += `**时间：** ${internship.dates}\n\n`;
        if (internship.description_points && internship.description_points.length > 0) {
          markdown += `**工作内容：**\n`;
          internship.description_points.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += `\n`;
        }
        if (index < data.internship_experience.length - 1) markdown += `---\n\n`;
      });
    }
    
    // 科研经历
    if (data.user_research_experience && data.user_research_experience.length > 0) {
      markdown += `## 科研经历\n\n`;
      data.user_research_experience.forEach((research, index) => {
        if (research.research_project) markdown += `**项目：** ${research.research_project}\n\n`;
        if (research.role) markdown += `**角色：** ${research.role}\n\n`;
        if (research.location) markdown += `**地点：** ${research.location}\n\n`;
        if (research.dates) markdown += `**时间：** ${research.dates}\n\n`;
        if (research.description_points && research.description_points.length > 0) {
          markdown += `**项目内容：**\n`;
          research.description_points.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += `\n`;
        }
        if (index < data.user_research_experience.length - 1) markdown += `---\n\n`;
      });
    }
    
    // 课外活动
    if (data.user_extracurricular_activities && data.user_extracurricular_activities.length > 0) {
      markdown += `## 课外活动\n\n`;
      data.user_extracurricular_activities.forEach((activity, index) => {
        if (activity.organization) markdown += `**组织：** ${activity.organization}\n\n`;
        if (activity.role) markdown += `**角色：** ${activity.role}\n\n`;
        if (activity.location) markdown += `**地点：** ${activity.location}\n\n`;
        if (activity.dates) markdown += `**时间：** ${activity.dates}\n\n`;
        if (activity.description_points && activity.description_points.length > 0) {
          markdown += `**活动内容：**\n`;
          activity.description_points.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += `\n`;
        }
        if (index < data.user_extracurricular_activities.length - 1) markdown += `---\n\n`;
      });
    }
    
    return markdown;
  };

  const handleRender = (content) => {
    setEditContent(content);
    setPreviewContent(content);
  };

  const handleSaveChanges = () => {
    // 将Markdown内容转换回JSON格式（简化处理）
    // 这里保持原有的数据结构，只是添加raw_content字段
    const updatedData = { 
      ...resumeData, 
      raw_content: editContent,
      // 确保有基本的用户ID
      user_uid: resumeData?.user_uid || `user-${Date.now()}`
    };
    setResumeData(updatedData);
    alert('修改已保存');
  };

  const handleAIAction = async (action) => {
    if (!editContent.trim()) {
      alert('请先输入内容');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      switch (action) {
        case 'evaluate':
          if (resumeData) {
            result = await agentAPI.evaluateResume(resumeData);
            alert(`简历测评结果：\n${result.processed_text}`);
          } else {
            alert('请先上传简历数据');
          }
          break;
        case 'polish':
          result = await agentAPI.rewriteText(editContent);
          setEditContent(result.rewritten_text);
          setPreviewContent(result.rewritten_text);
          break;
        case 'expand':
          result = await agentAPI.expandText(editContent);
          setEditContent(result.expanded_text);
          setPreviewContent(result.expanded_text);
          break;
        case 'contract':
          result = await agentAPI.contractText(editContent);
          setEditContent(result.contracted_text);
          setPreviewContent(result.contracted_text);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('AI功能调用失败:', error);
      alert('AI功能调用失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = (text, range) => {
    setSelectedText(text);
    setSelectionRange(range);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">留学简历制作助手</h1>
        <button
          onClick={() => setShowUploadCV(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          添加简历
        </button>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full w-full">
          {/* 左侧编辑区域 */}
          <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white">
            <PreviewEditbar config={config} setConfig={setConfig} />
            <div className="flex-1 overflow-hidden">
              <PreviewEditor 
                content={editContent} 
                onUpdate={handleRender}
                onTextSelection={handleTextSelection}
                selectedText={selectedText}
                selectionRange={selectionRange}
                isLoading={isLoading}
              />
            </div>
            {/* AI功能和保存按钮 */}
            <AIToolbar
              editContent={editContent}
              handleAIAction={handleAIAction}
              handleSaveChanges={handleSaveChanges}
              isLoading={isLoading}
            />
          </div>

          {/* 右侧预览区域 */}
          <div className="w-1/2 h-full flex flex-col bg-white">
            <div className="h-12 flex items-center px-4 font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">
              预览简历
            </div>
            <div className="flex-1 overflow-hidden">
              <RenderPreview 
                content={previewContent} 
                config={config}
                setConfig={setConfig}
                resumeData={resumeData}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 上传模态框 */}
      {showUploadCV && (
        <UploadCV
          onUpload={handleUpload}
          onClose={() => setShowUploadCV(false)}
        />
      )}
    </div>
  );
};

export default App;