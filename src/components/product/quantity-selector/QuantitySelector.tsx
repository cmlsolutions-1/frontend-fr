//src/components/product/quantity-selector/QuantitySelector.tsx (versión mejorada)
import { IoAddCircleOutline, IoRemoveCircleOutline } from 'react-icons/io5';
import { useState, useEffect } from 'react';

interface Props {
  quantity: number;
  onQuantityChanged: (value: number) => void;
  min?: number; // Valor mínimo (por defecto 1)
  max?: number; // Valor máximo (opcional)
  step?: number; // Paso para incremento/decremento (por defecto 1)
}

export const QuantitySelector = ({ 
  quantity, 
  onQuantityChanged, 
  min = 1, 
  max,
  step = 1
}: Props) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Actualizar el input cuando cambie la cantidad externamente
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const onValueChanged = (value: number) => {
    const newQuantity = quantity + value;
    
    if (newQuantity < min) return;
    if (max && newQuantity > max) return;

    onQuantityChanged(newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    let newQuantity = parseInt(inputValue, 10);

    if (isNaN(newQuantity) || newQuantity < min) {
      newQuantity = min;
    }
    
    if (max && newQuantity > max) {
      newQuantity = max;
    }

    onQuantityChanged(newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter y números
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'Escape' || e.key === 'Enter') {
      return;
    }
    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    // Solo permitir números
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleIncrement = () => {
    if (max && quantity >= max) return;
    onQuantityChanged(quantity + step);
  };

  const handleDecrement = () => {
    if (quantity <= min) return;
    onQuantityChanged(Math.max(min, quantity - step));
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={quantity <= min ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}
      >
        <IoRemoveCircleOutline size={30} className="text-gray-600" />
      </button>

      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyPress}
        className="w-16 mx-2 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Cantidad de producto"
      />

      <button 
        onClick={handleIncrement}
        disabled={max && quantity >= max}
        className={max && quantity >= max ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}
      >
        <IoAddCircleOutline size={30} className="text-gray-600" />
      </button>

      <span className="ml-2 text-sm text-gray-500">unidades</span>
    </div>
  );
};