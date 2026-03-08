import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EscrowContract } from "@/types/escrow";

interface EscrowTableProps {
  escrows: EscrowContract[];
  onSelect: (escrow: EscrowContract) => void;
}

const format = (address: string) => `${address.slice(0, 8)}...${address.slice(-4)}`;

const EscrowTable = ({ escrows, onSelect }: EscrowTableProps) => {
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/55 p-2 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Yield</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Landlord</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {escrows.map((escrow) => (
            <TableRow
              key={escrow.address}
              className="cursor-pointer"
              onClick={() => onSelect(escrow)}
            >
              <TableCell className="font-mono text-xs">{format(escrow.address)}</TableCell>
              <TableCell>{escrow.rentAmountEth} ETH</TableCell>
              <TableCell>{escrow.yieldPercent}%</TableCell>
              <TableCell className="font-mono text-xs">{format(escrow.tenant)}</TableCell>
              <TableCell className="font-mono text-xs">{format(escrow.landlord)}</TableCell>
              <TableCell className="capitalize">{escrow.status}</TableCell>
              <TableCell>{new Date(escrow.deadline).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EscrowTable;
