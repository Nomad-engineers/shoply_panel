'use client'

type Props = { onClick: () => void; disabled: boolean; isLoading: boolean };

const CalculateButton: React.FC<Props> = ({ onClick, disabled, isLoading }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-6 py-2 text-white rounded-[12px]"
    style={{ backgroundColor: !disabled ? '#55CB00' : 'rgba(9,9,29,0.25)' }}
  >
    {isLoading ? 'Загрузка...' : 'Расчет'}
  </button>
);

export default CalculateButton;
