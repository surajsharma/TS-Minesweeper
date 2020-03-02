import React, { useState, useEffect } from "react";

import "./App.scss";
import NumberDisplay from "../NumberDisplay";
import Button from "../Button";
import { generateCells, openMultipleCells } from "../../utils/";
import { Cell, Face, CellState, CellValue } from "../../types";
import { MAX_ROWS, MAX_COLS } from "../../constants";

const App: React.FC = () => {
    const [cells, setCells] = useState<Cell[][]>(generateCells());
    const [face, setFace] = useState<Face>(Face.smile);
    const [time, setTime] = useState<number>(0);
    const [live, setLive] = useState<boolean>();
    const [bombcounter, setBombCounter] = useState<number>(10);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [hasWon, setHasWon] = useState<boolean>(false);

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

    useEffect(() => {
        if (hasLost) {
            setFace(Face.lost);
            setLive(false);
        }
    }, [hasLost]);

    useEffect(() => {
        if (hasWon) {
            setFace(Face.won);
            setLive(false);
        }
    }, [hasWon]);

    const showAllBombs = (): Cell[][] => {
        const currentCells = cells.slice();
        return currentCells.map((row) =>
            row.map((cell) => {
                if (cell.value === CellValue.bomb) {
                    return { ...cell, state: CellState.visible };
                }
                return cell;
            })
        );
    };

    const handleCellClick = (
        rowParam: number,
        colParam: number
    ) => (): void => {
        let newCells = cells.slice();

        if (!live) {
            // TODO : ensure bomb does not get clicked on start
            if (newCells[rowParam][colParam].value === CellValue.bomb) {
                let isABomb = true;
                while (isABomb) {
                    newCells = generateCells();
                    if (newCells[rowParam][colParam].value !== CellValue.bomb) {
                        isABomb = false;
                        break;
                    }
                }
            }

            setLive(true);
        }

        const currentCell = newCells[rowParam][colParam];

        if (
            [CellState.flagged, CellState.visible].includes(currentCell.state)
        ) {
            return;
        }
        if (currentCell.value === CellValue.bomb) {
            newCells = showAllBombs();
            newCells[rowParam][colParam].red = true;
            setCells(newCells);
            setHasLost(true);
            return;
        } else if (currentCell.value === CellValue.none) {
            newCells = openMultipleCells(newCells, rowParam, colParam);
        } else {
            newCells[rowParam][colParam].state = CellState.visible;
        }

        //won
        let safeOpenCells = false;
        for (let row = 0; row < MAX_ROWS; row++) {
            for (let col = 0; col < MAX_COLS; col++) {
                const currentCell = newCells[row][col];
                if (
                    currentCell.value !== CellValue.bomb &&
                    currentCell.state === CellState.open
                ) {
                    safeOpenCells = true;
                    break;
                }
            }
        }

        if (!safeOpenCells) {
            newCells = newCells.map((row) =>
                row.map((cell) => {
                    if (cell.value === CellValue.bomb) {
                        return {
                            ...cell,
                            state: CellState.flagged
                        };
                    }
                    return cell;
                })
            );
            setHasWon(true);
        }
        setCells(newCells);
    };

    const handleFaceClick = (): void => {
        setLive(false);
        setTime(0);
        setCells(generateCells());
        setHasLost(false);
        setHasWon(false);
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
                    red={cell.red}
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
