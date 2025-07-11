export const Table = ({ children }) => <div className="overflow-x-auto">{children}</div>;
export const TableHeader = ({ children }) => <thead className="bg-gray-100">{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children }) => <tr className="border-b hover:bg-gray-50">{children}</tr>;
export const TableHead = ({ children }) => <th className="text-left py-3 px-4">{children}</th>;
export const TableCell = ({ children }) => <td className="py-3 px-4">{children}</td>;