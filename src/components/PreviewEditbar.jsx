// src/components/PreviewEditbar.jsx
export default function PreviewEditbar({ config, setConfig }) {
  return (
    <div className="h-12 flex items-center gap-6 px-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">字体：</label>
        <select
          value={config.font}
          onChange={(e) => setConfig({ ...config, font: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="SimSun">宋体</option>
          <option value="Arial">Arial</option>
          <option value="KaiTi">楷体</option>
          <option value="Microsoft YaHei">微软雅黑</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">字号：</label>
        <div className="flex items-center">
          <input
            type="number"
            value={config.fontSize}
            onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
            className="border border-gray-300 rounded-md w-16 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="8"
            max="24"
          />
          <span className="ml-1 text-sm text-gray-500">pt</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">行距：</label>
        <input
          type="number"
          step="0.1"
          value={config.lineHeight}
          onChange={(e) => setConfig({ ...config, lineHeight: Number(e.target.value) })}
          className="border border-gray-300 rounded-md w-16 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="0.8"
          max="3.0"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setConfig({ font: 'SimSun', fontSize: 12, lineHeight: 1.5 })}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          重置
        </button>
      </div>
    </div>
  );
}