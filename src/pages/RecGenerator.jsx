import React, { useState } from 'react';
import { Send, FileText, Edit3, Loader2 } from 'lucide-react';
import { generateRec } from '../services/RecagentAPI';

const RecGenerator = () => {
    const [inputText, setInputText] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            alert('请输入推荐信内容');
            return;
        }

        setIsLoading(true);
        try {
            const result = await generateRec(inputText);
            setGeneratedLetter(result);
        } catch (error) {
            console.error('Generation error:', error);
            alert(`生成推荐信时出错: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAll = () => {
        setInputText('');
        setGeneratedLetter(null);
    };

    const formatLetter = (letter) => {
        if (!letter || !letter.recommendation_letter) return '';
        
        const { header, date, recipient, salutation, body, closing } = letter.recommendation_letter;
        
        // 标题
        let formattedText = `Letter of Recommendation\n\n`;
        
        // header部分
        formattedText += `${header.institution}\n`;
        formattedText += `${header.department}\n`;
        formattedText += `${header.address}\n`;
        formattedText += `邮编 ${header.postal_code}，${header.country}\n`;
        formattedText += `电话：${header.phone}\n`;
        formattedText += `邮箱：${header.email}\n\n`;
        formattedText += `${date}\n\n`;
        
        // recipient部分
        formattedText += `${recipient.university}\n`;
        formattedText += `${recipient.address.replace(/, /g, '\n')}\n\n`;
        
        // salutation、body部分
        formattedText += `${salutation}\n\n`;
        formattedText += body.join('\n\n') + '\n\n';
        
        //closing部分
        formattedText += `${closing.sincerely}\n`;
        formattedText += `${closing.name}\n`;
        formattedText += `${closing.title}\n`;
        formattedText += `${closing.department}\n`;
        formattedText += `${closing.institution}\n`;
        formattedText += `电话：${closing.phone}\n`;
        formattedText += `邮箱：${closing.email}\n`;
        
        return formattedText;
    };
    const copyToClipboard = () => {
        if (!generatedLetter) return;
        const formattedText = formatLetter(generatedLetter);
        navigator.clipboard.writeText(formattedText)
            .then(() => alert('已复制到剪贴板'))
            .catch(() => alert('复制失败'));
    };

    const renderLetter = () => {
        if (!generatedLetter || !generatedLetter.recommendation_letter) return null;
        
        const formattedText = formatLetter(generatedLetter);
        
        return (
            <div className="whitespace-pre-wrap font-mono text-sm">
                {formattedText.split('\n').map((line, index) => (
                    <div key={index}>
                        {line}
                        {index < formattedText.split('\n').length - 1 && <br />}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                        <FileText className="text-blue-600" size={40} />
                        推荐信生成器
                    </h1>
                    <p className="text-gray-600 text-lg">智能润色您的推荐信，助力留学申请</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* 左侧输入区域 */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800">原始推荐信</h2>
                        </div>
                        
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="请在此输入您的推荐信内容..."
                            className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 leading-relaxed"
                        />
                        
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !inputText.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        生成中...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        生成润色版本
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={clearAll}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                            >
                                清空
                            </button>
                        </div>
                    </div>

                    {/* 右侧展示区域 */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="text-gray-600" size={24} />
                            <h2 className="text-xl font-semibold text-gray-800">润色后的推荐信</h2>
                        </div>
                        
                        <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <Loader2 className="animate-spin mb-4" size={40} />
                                    <p>正在生成润色版本，请稍候...</p>
                                </div>
                            ) : generatedLetter ? (
                                renderLetter()
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FileText size={60} className="mb-4" />
                                    <p className="text-center">润色后的推荐信将在这里显示</p>
                                    <p className="text-sm text-center mt-2">请在左侧输入原始内容并点击生成按钮</p>
                                </div>
                            )}
                        </div>
                        
                        {generatedLetter && (
                            <div className="mt-4 flex gap-3">
                                <button 
                                    onClick={copyToClipboard}
                                    className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    复制全文
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecGenerator;