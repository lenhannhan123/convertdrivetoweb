import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Video,
  Play,
  Code2,
  Copy,
  Check,
  Smartphone,
  Monitor,
  LayoutGrid,
  Settings2,
  Trash2,
  Sparkles,
  ExternalLink,
  Download,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { parseDriveLinks, generateEmbedCode } from './utils/driveParser';
import './App.css';

export default function App() {
  // Input raw state
  const [inputText, setInputText] = useState('');
  
  // Customization Options
  const [aspectPreset, setAspectPreset] = useState('9/16'); // '9/16', '16/9', '1/1', '4/5', 'custom'
  const [customRatio, setCustomRatio] = useState('9/16');
  const [maxWidth, setMaxWidth] = useState('360px');
  const [borderRadius, setBorderRadius] = useState('12px');
  const [boxShadow, setBoxShadow] = useState('none');
  const [allowAutoplay, setAllowAutoplay] = useState(true);
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [loadingLazy, setLoadingLazy] = useState(false);
  const [layout, setLayout] = useState('stacked'); // 'stacked' | 'grid'
  const [gridColumns, setGridColumns] = useState(2);

  // UI View state
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'
  const [codeFormat, setCodeFormat] = useState('html-inline'); // 'html-inline' | 'html-css' | 'react-jsx' | 'urls'
  const [deviceMockup, setDeviceMockup] = useState('phone'); // 'fit' | 'phone' | 'desktop'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // Parse items memoized
  const parsedItems = useMemo(() => {
    return parseDriveLinks(inputText);
  }, [inputText]);

  const validItems = useMemo(() => {
    return parsedItems.filter(item => item.isValid);
  }, [parsedItems]);

  // Current effective aspect ratio
  const currentRatio = aspectPreset === 'custom' ? customRatio : aspectPreset;

  // Options bundle
  const options = useMemo(() => ({
    aspectRatio: currentRatio,
    maxWidth,
    borderRadius,
    boxShadow,
    allowAutoplay,
    allowFullscreen,
    loadingLazy,
    format: codeFormat,
    layout,
    gridColumns,
    margin: '0 auto 20px auto',
  }), [currentRatio, maxWidth, borderRadius, boxShadow, allowAutoplay, allowFullscreen, loadingLazy, codeFormat, layout, gridColumns]);

  // Generated code output
  const generatedCode = useMemo(() => {
    return generateEmbedCode(parsedItems, options);
  }, [parsedItems, options]);

  // Toast notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Preset Ratio Handlers
  const handleSelectPreset = (preset) => {
    setAspectPreset(preset);
    if (preset === '9/16') {
      setMaxWidth('360px');
      setDeviceMockup('phone');
    } else if (preset === '16/9') {
      setMaxWidth('640px');
      setDeviceMockup('desktop');
    } else if (preset === '1/1') {
      setMaxWidth('480px');
      setDeviceMockup('fit');
    } else if (preset === '4/5') {
      setMaxWidth('420px');
      setDeviceMockup('phone');
    }
  };

  // Copy to clipboard with confetti
  const handleCopyCode = (textToCopy = generatedCode) => {
    if (!textToCopy) {
      showToast('⚠️ Không có video hợp lệ để xuất mã!');
      return;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      showToast('✨ Đã sao chép mã nhúng vào clipboard!');
      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#06b6d4'],
        });
      } catch (e) {
        // Fallback silently if canvas-confetti is not loaded
      }
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Export action: switch to code tab + copy
  const handleExport = () => {
    if (validItems.length === 0) {
      showToast('⚠️ Vui lòng nhập ít nhất 1 link Google Drive hợp lệ');
      return;
    }
    setActiveTab('code');
    handleCopyCode(generatedCode);
  };

  // Download Demo HTML File
  const handleDownloadHtml = () => {
    if (!generatedCode) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Drive Videos Embed Demo</title>
  <style>
    body {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 1.5rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Google Drive Video Player Demo</h1>
  ${generatedCode}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `embed-drive-${aspectPreset.replace('/', 'x')}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('💾 Đã tải file HTML xem thử về máy!');
  };

  // Remove single video
  const handleRemoveItem = (index) => {
    const lines = inputText.split(/\r?\n/).filter(Boolean);
    if (index >= 0 && index < lines.length) {
      lines.splice(index, 1);
      setInputText(lines.join('\n'));
      showToast('🗑️ Đã xóa video khỏi danh sách');
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon">
            <Video size={24} />
          </div>
          <div className="brand-title-wrap">
            <h1>
              Google Drive Video Embedder
              <span className="badge-tag">PRO</span>
            </h1>
            <p>Trình tạo mã nhúng video Drive dọc (Shorts) & ngang (16:9), xem trước tức thì</p>
          </div>
        </div>

        <div className="header-actions">
          {inputText && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setInputText('');
                showToast('🧹 Đã xóa toàn bộ link');
              }}
            >
              <Trash2 size={15} />
              Xóa hết
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <main className="main-workspace">
        {/* LEFT COLUMN: Input & Settings */}
        <section className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Sliders size={18} className="text-accent" />
              <span>Thiết lập & Đường link</span>
            </div>
            <span className="badge-tag">
              {validItems.length} video hợp lệ
            </span>
          </div>

          <div className="panel-body">
            {/* Input Links */}
            <div className="form-group">
              <div className="label-row">
                <span>Dán link Google Drive (Mỗi link 1 dòng)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Hỗ trợ link xem, chia sẻ, hoặc ID
                </span>
              </div>
              <div className="textarea-container">
                <textarea
                  className="url-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={"Dán các đường link Google Drive vào đây (mỗi link một dòng)...\nhttps://drive.google.com/file/d/...\nhttps://drive.google.com/open?id=..."}
                  rows={5}
                />
              </div>
              <div className="textarea-footer">
                <div className={`status-indicator ${validItems.length === 0 ? 'warning' : ''}`}>
                  <Play size={13} />
                  <span>
                    {validItems.length > 0
                      ? `Sẵn sàng tạo ${validItems.length} video nhúng`
                      : 'Hãy dán ít nhất 1 link Google Drive'}
                  </span>
                </div>
                <span>{parsedItems.length} dòng</span>
              </div>
            </div>

            {/* Frame Aspect Ratio Selection */}
            <div className="form-group">
              <label className="label-row">
                <span>Chọn định dạng khung</span>
                <span style={{ color: 'var(--accent-primary)', fontSize: '0.78rem' }}>
                  {aspectPreset === '9/16' ? 'Dọc (Shorts/TikTok)' : aspectPreset === '16/9' ? 'Ngang (YouTube/Web)' : aspectPreset}
                </span>
              </label>

              <div className="aspect-selector">
                {/* Dọc 9:16 */}
                <button
                  type="button"
                  className={`ratio-btn ${aspectPreset === '9/16' ? 'active' : ''}`}
                  onClick={() => handleSelectPreset('9/16')}
                >
                  <div className="ratio-header">
                    <Smartphone size={16} />
                    <span>Khung Dọc</span>
                    <span className="ratio-badge">9:16</span>
                  </div>
                  <span className="ratio-desc">TikTok, Reels, Shorts (max 360px)</span>
                </button>

                {/* Ngang 16:9 */}
                <button
                  type="button"
                  className={`ratio-btn ${aspectPreset === '16/9' ? 'active' : ''}`}
                  onClick={() => handleSelectPreset('16/9')}
                >
                  <div className="ratio-header">
                    <Monitor size={16} />
                    <span>Khung Ngang</span>
                    <span className="ratio-badge">16:9</span>
                  </div>
                  <span className="ratio-desc">YouTube, Video ngang (max 640px)</span>
                </button>

                {/* Vuông 1:1 */}
                <button
                  type="button"
                  className={`ratio-btn ${aspectPreset === '1/1' ? 'active' : ''}`}
                  onClick={() => handleSelectPreset('1/1')}
                >
                  <div className="ratio-header">
                    <Layers size={16} />
                    <span>Khung Vuông</span>
                    <span className="ratio-badge">1:1</span>
                  </div>
                  <span className="ratio-desc">Instagram Feed, Bài viết (max 480px)</span>
                </button>

                {/* Tùy chỉnh */}
                <button
                  type="button"
                  className={`ratio-btn ${aspectPreset === 'custom' ? 'active' : ''}`}
                  onClick={() => setAspectPreset('custom')}
                >
                  <div className="ratio-header">
                    <Maximize2 size={16} />
                    <span>Tùy chỉnh</span>
                    <span className="ratio-badge">Custom</span>
                  </div>
                  <span className="ratio-desc">Tự do chỉnh tỉ lệ & độ rộng</span>
                </button>
              </div>

              {aspectPreset === 'custom' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={customRatio}
                    onChange={(e) => setCustomRatio(e.target.value)}
                    placeholder="Tỉ lệ (VD: 9/16, 16/9, 4/3)"
                    className="url-textarea"
                    style={{ minHeight: '40px', height: '40px', padding: '8px 12px' }}
                  />
                  <input
                    type="text"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(e.target.value)}
                    placeholder="Độ rộng (VD: 500px, 100%)"
                    className="url-textarea"
                    style={{ minHeight: '40px', height: '40px', padding: '8px 12px' }}
                  />
                </div>
              )}
            </div>

            {/* Quick Width Presets */}
            {aspectPreset !== 'custom' && (
              <div className="form-group">
                <label className="label-row">
                  <span>Chiều rộng tối đa (Max Width)</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{maxWidth}</span>
                </label>
                <div className="chip-row">
                  {['320px', '360px', '480px', '640px', '720px', '100%'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`chip-btn ${maxWidth === w ? 'active' : ''}`}
                      onClick={() => setMaxWidth(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Customizations Dropdown */}
            <div className="settings-collapsible">
              <button
                type="button"
                className="settings-toggle-btn"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings2 size={16} />
                  Tùy chỉnh bo góc, bóng đổ & phát video
                </span>
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showAdvanced && (
                <div className="settings-content animate-fade-in">
                  {/* Bo góc */}
                  <div className="form-group">
                    <label className="label-row">
                      <span>Bo góc (Border Radius)</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{borderRadius}</span>
                    </label>
                    <div className="chip-row">
                      {['0px', '8px', '12px', '16px', '20px', '28px'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`chip-btn ${borderRadius === r ? 'active' : ''}`}
                          onClick={() => setBorderRadius(r)}
                        >
                          {r === '12px' ? '12px (Mẫu)' : r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hiệu ứng bóng đổ */}
                  <div className="form-group">
                    <label className="label-row">
                      <span>Hiệu ứng đổ bóng (Box Shadow)</span>
                    </label>
                    <div className="chip-row">
                      {[
                        { id: 'none', label: 'Không bóng' },
                        { id: 'soft', label: 'Bóng mềm' },
                        { id: 'elevated', label: 'Sang trọng' },
                        { id: 'glow', label: 'Đèn Neon Glow' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`chip-btn ${boxShadow === s.id ? 'active' : ''}`}
                          onClick={() => setBoxShadow(s.id)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bố cục khi có nhiều video */}
                  {validItems.length > 1 && (
                    <div className="form-group">
                      <label className="label-row">
                        <span>Bố cục danh sách video</span>
                      </label>
                      <div className="chip-row">
                        <button
                          type="button"
                          className={`chip-btn ${layout === 'stacked' ? 'active' : ''}`}
                          onClick={() => setLayout('stacked')}
                        >
                          Nối tiếp (Từng video một)
                        </button>
                        <button
                          type="button"
                          className={`chip-btn ${layout === 'grid' ? 'active' : ''}`}
                          onClick={() => setLayout('grid')}
                        >
                          Dàn lưới (Responsive Grid)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toggles */}
                  <div
                    className="toggle-row"
                    onClick={() => setAllowAutoplay(!allowAutoplay)}
                  >
                    <span>Cho phép tự động phát (Autoplay)</span>
                    <div className={`toggle-switch ${allowAutoplay ? 'checked' : ''}`}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>

                  <div
                    className="toggle-row"
                    onClick={() => setAllowFullscreen(!allowFullscreen)}
                  >
                    <span>Cho phép xem toàn màn hình (Fullscreen)</span>
                    <div className={`toggle-switch ${allowFullscreen ? 'checked' : ''}`}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>

                  <div
                    className="toggle-row"
                    onClick={() => setLoadingLazy(!loadingLazy)}
                  >
                    <span>Tải chậm tiết kiệm băng thông (Lazy loading)</span>
                    <div className={`toggle-switch ${loadingLazy ? 'checked' : ''}`}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Big Action Button */}
            <button
              type="button"
              className="btn-primary-gradient"
              onClick={handleExport}
            >
              <Sparkles size={18} />
              <span>⚡ Xuất mã nhúng & Sao chép ngay</span>
            </button>

            {/* Note & Hint */}
            <div className="info-card">
              <HelpCircle size={20} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />
              <div>
                <strong>Lưu ý quyền Drive:</strong> Video cần được mở quyền{' '}
                <em>"Bất kỳ ai có liên kết" (Anyone with the link can view)</em> để người truy cập web có thể xem được mà không bị chặn đăng nhập.
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Live Preview & Code Generator */}
        <section className="glass-panel">
          {/* Header with Tabs */}
          <div className="panel-header">
            <div className="tab-nav">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <Play size={16} />
                <span>Xem trước trực tiếp ({validItems.length})</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <Code2 size={16} />
                <span>Mã nhúng đã xuất</span>
              </button>
            </div>

            {activeTab === 'code' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleDownloadHtml}
                  title="Tải file HTML về máy"
                >
                  <Download size={14} />
                  <span>Tải .html</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => handleCopyCode(generatedCode)}
                  style={{ color: copied ? 'var(--success)' : 'inherit' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleCopyCode(generatedCode)}
                style={{ color: copied ? 'var(--success)' : 'inherit' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>Sao chép mã nhúng</span>
              </button>
            )}
          </div>

          {/* TAB 1: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="preview-container animate-fade-in">
              {/* Mockup Device Toolbar */}
              <div className="mockup-bar">
                <div className="device-switcher">
                  <button
                    type="button"
                    className={`device-btn ${deviceMockup === 'fit' ? 'active' : ''}`}
                    onClick={() => setDeviceMockup('fit')}
                  >
                    <LayoutGrid size={14} />
                    <span>Chuẩn web</span>
                  </button>
                  <button
                    type="button"
                    className={`device-btn ${deviceMockup === 'phone' ? 'active' : ''}`}
                    onClick={() => setDeviceMockup('phone')}
                  >
                    <Smartphone size={14} />
                    <span>Điện thoại</span>
                  </button>
                  <button
                    type="button"
                    className={`device-btn ${deviceMockup === 'desktop' ? 'active' : ''}`}
                    onClick={() => setDeviceMockup('desktop')}
                  >
                    <Monitor size={14} />
                    <span>Máy tính</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  <span>Tỉ lệ: <strong style={{ color: '#e2e8f0' }}>{currentRatio}</strong></span>
                  <span>•</span>
                  <span>Rộng: <strong style={{ color: '#e2e8f0' }}>{maxWidth}</strong></span>
                  <span>•</span>
                  <span>Bo góc: <strong style={{ color: '#e2e8f0' }}>{borderRadius}</strong></span>
                </div>
              </div>

              {/* Preview Canvas Area */}
              <div className="preview-stage">
                {validItems.length === 0 ? (
                  <div className="empty-preview">
                    <div className="empty-preview-icon">
                      <Video size={28} />
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>
                        Chưa có video nào để hiển thị
                      </h3>
                      <p style={{ fontSize: '0.82rem' }}>
                        Hãy dán link Google Drive vào ô nhập liệu bên trái để xem trước và tạo mã nhúng
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={deviceMockup === 'phone' ? 'phone-mockup-wrapper' : ''}
                    style={{
                      width: '100%',
                      maxWidth: deviceMockup === 'phone' ? '380px' : deviceMockup === 'desktop' ? '920px' : '100%',
                    }}
                  >
                    {deviceMockup === 'phone' && <div className="phone-speaker" />}

                    {/* Videos Container */}
                    <div
                      style={{
                        display: layout === 'grid' && validItems.length > 1 && deviceMockup !== 'phone' ? 'grid' : 'flex',
                        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${maxWidth}), 1fr))`,
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%',
                      }}
                    >
                      {validItems.map((item, index) => (
                        <div key={item.id} className="preview-video-card">
                          {/* Card Topbar */}
                          <div className="preview-video-meta">
                            <span style={{ fontWeight: 600 }}>Video #{index + 1}</span>
                            <div className="preview-video-actions">
                              <a
                                href={item.viewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="icon-action-btn"
                                title="Mở trong Google Drive"
                              >
                                <ExternalLink size={13} />
                              </a>
                              <button
                                type="button"
                                className="icon-action-btn"
                                onClick={() => {
                                  const singleCode = generateEmbedCode([item], options);
                                  handleCopyCode(singleCode);
                                }}
                                title="Sao chép riêng mã video này"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                type="button"
                                className="icon-action-btn delete"
                                onClick={() => handleRemoveItem(index)}
                                title="Xóa video này"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* The actual Embed Frame */}
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              maxWidth: layout === 'grid' && deviceMockup !== 'phone' ? '100%' : maxWidth,
                              aspectRatio: currentRatio,
                              margin: '0 auto',
                              backgroundColor: '#000',
                              borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
                              overflow: 'hidden',
                              boxShadow: boxShadow === 'soft' 
                                ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' 
                                : boxShadow === 'elevated' 
                                ? '0 20px 30px -10px rgba(0, 0, 0, 0.6)' 
                                : boxShadow === 'glow' 
                                ? '0 0 25px rgba(99, 102, 241, 0.4)' 
                                : 'none',
                            }}
                          >
                            <iframe
                              src={item.previewUrl}
                              title={`Video Drive ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
                              }}
                              allow="autoplay; encrypted-media; picture-in-picture"
                              allowFullScreen={allowFullscreen}
                              loading={loadingLazy ? 'lazy' : 'eager'}
                              frameBorder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {deviceMockup === 'phone' && <div className="phone-home-indicator" />}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GENERATED CODE */}
          {activeTab === 'code' && (
            <div className="code-screen animate-fade-in">
              <div className="code-screen-header">
                <div className="format-pills">
                  <button
                    type="button"
                    className={`format-pill ${codeFormat === 'html-inline' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('html-inline')}
                  >
                    HTML Inline (Chuẩn mẫu)
                  </button>
                  <button
                    type="button"
                    className={`format-pill ${codeFormat === 'html-css' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('html-css')}
                  >
                    HTML + Clean CSS
                  </button>
                  <button
                    type="button"
                    className={`format-pill ${codeFormat === 'react-jsx' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('react-jsx')}
                  >
                    React JSX Component
                  </button>
                  <button
                    type="button"
                    className={`format-pill ${codeFormat === 'urls' ? 'active' : ''}`}
                    onClick={() => setCodeFormat('urls')}
                  >
                    Link Preview thuần
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {validItems.length} video trong mã
                </div>
              </div>

              {/* Code Editor Preview */}
              <div className="code-editor-box">
                <pre>
                  <code>{generatedCode || '// Hãy dán link Google Drive để tạo mã nhúng'}</code>
                </pre>
              </div>

              {/* Bottom Instructions */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-primary-gradient"
                    style={{ flex: 1, minWidth: '220px' }}
                    onClick={() => handleCopyCode(generatedCode)}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép toàn bộ mã (1-Click)'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '12px 18px', fontSize: '0.9rem' }}
                    onClick={handleDownloadHtml}
                  >
                    <Download size={16} />
                    <span>Tải file .html về máy</span>
                  </button>
                </div>

                <div className="info-card">
                  <AlertCircle size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <div>
                    <strong>Cách dán vào website của bạn:</strong>
                    <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.6 }}>
                      <li><strong>WordPress / Elementor / Gutenberg:</strong> Thêm khối <em>Custom HTML</em> rồi dán mã này vào.</li>
                      <li><strong>Haravan / Sapo / Shopify:</strong> Chuyển khung soạn thảo sang chế độ <code>&lt;&gt; HTML</code> rồi dán vào.</li>
                      <li><strong>React / Next.js:</strong> Chọn tab <em>React JSX Component</em> bên trên để copy component hoàn chỉnh.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="toast-notice">
          <Sparkles size={16} style={{ color: '#a855f7' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
