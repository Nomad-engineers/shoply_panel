'use client'

import { Button } from "../ui";

type Props = { onClick: () => void; disabled: boolean; isLoading: boolean };

const CalculateButton: React.FC<Props> = ({ onClick, disabled, isLoading }) => (
  <Button
    onClick={onClick}
    disabled={disabled || isLoading}
    size="default"
    variant={"success"}
  >
    {isLoading ? "Загрузка..." : "Расчет"}
  </Button>
);

export default CalculateButton;
