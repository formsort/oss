import {
  setAnswerValue,
  getAnswerValue,
  AnswerType,
} from '@formsort/custom-question-api';
import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';

const MyCustomComponent = () => {
  // Set name to null before initializing
  const [name, setName] = useState<AnswerType | null>(null);

  useEffect(() => {
    const updateName = async () => {
      if (name === null) {
        // If remote value exists, set to remote
        // Otherwise, initialize the local value
        const answerValue = await getAnswerValue();
        if (answerValue !== undefined) {
          setName(answerValue);
        } else {
          setName('');
        }
        return;
      }
      setAnswerValue(name);
    };

    void updateName();
  }, [name]);

  // Check if not initialized yet
  if (name === null) {
    return <div>...</div>;
  }

  return (
    <div>
      What is your name?
      <input
        type="text"
        value={name.toString()}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};

ReactDom.render(<MyCustomComponent />, document.getElementById('root'));
