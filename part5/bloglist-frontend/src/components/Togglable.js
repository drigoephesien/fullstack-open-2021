import React, { useState, forwardRef, useImperativeHandle } from 'react';

const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  const hideWhenVisible = { display: visible ? 'none' : '' };
  const showWhenVisible = { display: visible ? '' : 'none' };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  useImperativeHandle(ref, () => {
    return {
      toggleVisibility,
    };
  });

  return (
    <>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility} className='btn mt-12'>
          {props.buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility} className='btn mt-12'>
          Cancel
        </button>
      </div>
    </>
  );
});

export default Togglable;
