import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';

const Terminal = () => {
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('~');
    const [history, setHistory] = useState([]);
    const terminalRef = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const command = input.trim();
            const newHistory = [...history, { cwd, command }];
            setHistory(newHistory);
            setInput('');

            try {
                const response = await fetch('http://localhost:8080/api/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ payload: command }),
                });
                const data = await response.json();
                setCwd(data.cwd);
                setHistory([...newHistory, { cwd: data.cwd, output: data.cwd }]);
            } catch (error) {
                console.error('Error:', error);
                setHistory([...newHistory, { cwd, output: `Error: ${error.message}` }]);
            }
        }
    };

    useEffect(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [history]);

    return (
        <div className="terminal" ref={terminalRef}>
            <div className="history">
                {history.map((entry, index) => (
                    <div key={index}>
                        <div>
                            <span className="prompt">MUH@iBook-CalculatorPro:{entry.cwd} $ </span>
                            <span className="command">{entry.command}</span>
                        </div>
                        {entry.output && (
                            <div className="output">
                                {entry.output.split('\n').map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="input-line">
                <span className="prompt">MUH@iBook-CalculatorPro:{cwd} $ </span>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            </div>
        </div>
    );
};

export default Terminal;