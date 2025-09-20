import React from 'react';

const Avatar = ({ 
  name, 
  size = 'md', 
  backgroundColor = '#6366f1',
  showTooltip = true,
  className = ''
}) => {
  // 如果没有名字，返回 null
  if (!name) return null;

  // 定义不同尺寸的配置
  const sizeConfig = {
    sm: { width: 'w-6', height: 'h-6', fontSize: 'text-sm' },
    md: { width: 'w-8', height: 'h-8', fontSize: 'text-sm' },
    lg: { width: 'w-10', height: 'h-10', fontSize: 'text-base' },
    xl: { width: 'w-12', height: 'h-12', fontSize: 'text-lg' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // 获取显示文本（如果是中文名显示姓氏，英文名显示首字母）
  const getDisplayText = (fullName) => {
    if (!fullName) return '';
    
    // 如果是中文名且长度大于2，显示后两个字
    if (/^[\u4e00-\u9fa5]+$/.test(fullName) && fullName.length > 2) {
        return fullName.slice(-2); // 显示后两个字
    }
    
    // 如果是英文名且有空格，显示首字母组合
    if (fullName.includes(' ')) {
      return fullName.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
    }
    
    // 其他情况显示后两个字符
    return fullName.slice(-2); // 显示后两个字
  };

  const displayText = getDisplayText(name);

  return (
    <div
      className={`
        ${config.width} 
        ${config.height} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        ${config.fontSize} 
        font-medium 
        border-2 
        border-white 
        hover:z-10 
        hover:scale-110 
        transition-transform 
        cursor-pointer
        ${className}
      `}
      style={{ backgroundColor }}
      title={showTooltip ? name : undefined}
    >
      <span className="truncate w-full text-center" title={name}>
        {displayText}
      </span>
    </div>
  );
};

export default Avatar;