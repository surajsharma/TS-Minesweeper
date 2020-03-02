import React, { useState, useEffect } from "react";

import "./App.scss";
import NumberDisplay from "../NumberDisplay";
import Button from "../Button";
import { generateCells } from "../../utils/";
import { Cell, Face, CellState } from "../../types";

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>();
    const [bombcounter, setBombCounter] = useState<number>(10);
    // console.log(cells, "cells");

    useEffect(() => {
        const handleMouseDown = (): void => {
            setFace(Face.oh);
        };

        const handleMouseUp = (): void => {
            setFace(Face.smile);
        };

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (live && time < 999) {
            const timer = setInterval(() => {
                setTime(time + 1);
            }, 1000);
            return () => {
                clearInterval(timer);
            };
        }
    }, [live, time]);

    const handleCellClick = (
        rowParam: number,
        colParam: number
    ) => (): void => {
        if (!live) {
            setLive(true);
        }
    };

    const handleFaceClick = (): void => {
        if (live) {
            setLive(false);
            setTime(0);
            setCells(generateCells());
        }
    };

    const handleRightClick = (rowParam: number, colParam: number) => (
        e: React.MouseEvent
    ): void => {
        e.preventDefault();

        if (!live) {
            return;
        }
        const currentCell = cells[rowParam][colParam];
        const currentCells = cells.slice();

        if (currentCell.state === CellState.visible) {
            return;
        } else if (currentCell.state === CellState.open) {
            currentCells[rowParam][colParam].state = CellState.flagged;
            setCells(currentCells);
            setBombCounter(bombcounter - 1);
        } else if (currentCell.state === CellState.flagged) {
            currentCells[rowParam][colParam].state = CellState.open;
            setCells(currentCells);
            setBombCounter(bombcounter + 1);
        }
    };

    const renderCells = (): React.ReactNode => {
        return cells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
                <Button
                    key={`${rowIndex}-${colIndex}`}
                    state={cell.state}
                    value={cell.value}
                    row={rowIndex}
                    col={colIndex}
                    onClick={handleCellClick}
                    onContext={handleRightClick}
                />
            ))
        );
    };

    return (
        <div className="App">
            <div className="Header">
                <NumberDisplay value={bombcounter} />
                <div className="Face" onClick={handleFaceClick}>
                    <span role="img" aria-label="face">
                        {face}
                    </span>
                </div>
                <NumberDisplay value={time} />
            </div>
            <div className="Body">{renderCells()}</div>
        </div>
    );
};

export default App;
