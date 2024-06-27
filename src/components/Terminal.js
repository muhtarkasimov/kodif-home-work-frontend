import React, { useState, useEffect, useRef } from 'react';
import './Terminal.css';

const Terminal = () => {
    const [input, setInput] = useState('');
    const [pwd, setPwd] = useState('~');
    const [history, setHistory] = useState([]);
    const terminalRef = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            const command = input.trim();
            if (command === 'clear') {
                setHistory([]);
                setInput('');
                return;
            }

            const newHistory = [...history, { cwd: pwd, command }];
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
                setPwd(data.pwd);
                setHistory((prevHistory) => [
                    ...prevHistory.slice(0, -1),
                    { cwd: pwd, command, output: data.cwd },
                    { cwd: data.pwd }
                ]);
            } catch (error) {
                console.error('Error:', error);
                setHistory((prevHistory) => [
                    ...prevHistory.slice(0, -1),
                    { cwd: pwd, command, output: `Error: ${error.message}` },
                    { cwd: pwd }
                ]);
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
                        {entry.command && (
                            <div>
                                <span className="prompt green">MUH@iBook-CalculatorPro: </span>
                                <span className="prompt yellow">{entry.cwd} </span>
                                <span className="prompt"> % </span>
                                <span className="command">{entry.command}</span>
                            </div>
                        )}
                        {entry.output && (
                            <div className="output">
                                {entry.output.split('\n').map((line, i) => (
                                    <div key={i}>{line}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div className="input-line">
                    <span className="prompt green">MUH@iBook-CalculatorPro: </span>
                    <span className="prompt yellow">{pwd} </span>
                    <span className="prompt"> % </span>
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default Terminal;