import React, { useEffect, useRef } from 'react';

const phrases = [
  "智能驱动，<br>精准管理绩效。",
  "协同创作，<br>效率倍增。",
  "数据洞察，<br>驱动决策。"
];

const Typewriter = () => {
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentPhrase = phrases[phraseIndex];
      let typeSpeed = isDeleting ? 60 : 120;

      if (isDeleting) {
        const content = currentPhrase.substring(0, charIndex);
        if (content.endsWith('>')) {
          const tagStartIndex = content.lastIndexOf('<');
          charIndex = tagStartIndex;
        } else {
          charIndex--;
        }
        target.innerHTML = currentPhrase.substring(0, charIndex);
      } else {
        if (currentPhrase.charAt(charIndex) === '<') {
          const tagEndIndex = currentPhrase.indexOf('>', charIndex);
          charIndex = tagEndIndex + 1;
        } else {
          charIndex++;
        }
        target.innerHTML = currentPhrase.substring(0, charIndex);
      }

      if (!isDeleting && charIndex >= currentPhrase.length) {
        charIndex = currentPhrase.length;
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex <= 0) {
        charIndex = 0;
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    type();

    // 清理函数
    return () => {
      target.innerHTML = '';
    };
  }, []);

  return (
    <div className="text-3xl font-bold leading-snug max-w-md" style={{ height: '96px' }}>
      <span id="typewriter-text" ref={targetRef}></span>
      <span className="typewriter-cursor">|</span>
    </div>
  );
};

export default Typewriter;