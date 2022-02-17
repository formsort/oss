import ReactDom from "react-dom";
import React, { useEffect, useState } from "react";
import { setAnswerValue, getAnswerValue } from "@formsort/custom-question-api";

const MyCustomComponent = () => {
  // Set name to null before initializing
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const updateName = async () => {
      if (name === null) {
        // If remote value exists, set to remote
        // Otherwise, initialize the local value
        const answerValue = await getAnswerValue<string>();
        if (answerValue !== undefined) {
          setName(answerValue);
        } else {
          setName("");
        }
        return;
      }
      setAnswerValue(name);
    };

    updateName();
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
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};

ReactDom.render(<MyCustomComponent />, document.getElementById("root"));
