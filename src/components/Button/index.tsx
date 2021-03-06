import React from "react";
import "./Button.scss";
import { CellState, CellValue } from "../../types";

interface ButtonProps {
    row: number;
    col: number;
    state: CellState;
    value: CellValue;
    onClick(rowParam: number, colParam: number): (...args: any[]) => void;
    onContext(rowParam: number, colParam: number): (...args: any[]) => void;
    red?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    row,
    red,
    col,
    state,
    value,
    onClick,
    onContext
}) => {
    const renderContent = (): React.ReactNode => {
        if (state === CellState.visible) {
            if (value === CellValue.bomb) {
                return (
                    <span role="img" aria-label="alien">
                        👾
                    </span>
                );
            } else if (value === CellValue.none) {
                return null;
            }

            return value;
        } else if (state === CellState.flagged) {
            //TODO display cell emoji
            return (
                <span role="img" aria-label="alien">
                    📫
                </span>
            );
        }
    };

    return (
        <div
            className={`Button ${
                state === CellState.visible ? "visible" : ""
            } value-${value} ${red ? "red" : ""}`}
            onClick={onClick(row, col)}
            onContextMenu={onContext(row, col)}
        >
            {renderContent()}
        </div>
    );
};

export default Button;
