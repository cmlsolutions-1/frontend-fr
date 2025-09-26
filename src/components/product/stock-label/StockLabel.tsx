// src/components/StockLabel.tsx
import { titleFont } from "@/config/fonts";

interface Props {
  stock: number | undefined;
}

export const StockLabel = ({ stock }: Props) => {
  return (
    <h1 className={`${titleFont.className} antialiased font-bold text-lg`}>
      {stock !== undefined ? `Stock: ${stock}` : "Stock no disponible"}
    </h1>
  );
};
