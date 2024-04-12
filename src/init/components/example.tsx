import React, { useState } from 'react';

const Example = () => {
  const [count, setCount] = useState(0);
  return <div id="example">
    <button onClick={() => setCount(count - 1)}>-1</button>
    <input type="text" readOnly value={count} />
    <button onClick={() => setCount(count + 1)}>+1</button>
  </div>
}
export default Example;