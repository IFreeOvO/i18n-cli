import { setLocale, getLocale } from 'umi';
import { useState } from 'react';

export default function HomePage() {
  let [count, setCount] = useState(1);

  const toggleLocale = () => {
    const lang = getLocale() === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(lang, false);
  };

  const add = () => {
    setCount(count + 1);
  };

  const title = '计数器';

  return (
    <div>
      <button title="哈哈" onClick={toggleLocale}>
        切换语言
      </button>
      <h2>{title}</h2>
      <p>{'数字' + count}</p>
      <button onClick={add}>点击数字加1</button>
    </div>
  );
}
