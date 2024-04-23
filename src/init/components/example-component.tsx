import React, { useState } from 'react';

const Example = () => {
  const [count, setCount] = useState<number>(0);

  return <div id="example">
    <button onClick={() => setCount(count - 1)}>Decrement</button>
    <input type="text" value={count} readOnly />
    <button onClick={() => setCount(count + 1)}>Increment</button>
  </div>
}
export default Example;