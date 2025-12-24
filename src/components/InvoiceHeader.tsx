interface InvoiceHeaderProps {
  copyType?: string;
}

const InvoiceHeader = ({ copyType }: InvoiceHeaderProps) => {
  return (
    <div className="invoice-header">
      <h1 className="invoice-title">NILAM TIMES</h1>
      <p className="text-primary text-sm font-medium mt-1">
        4-PATELNAGAR, 1-SADBHAVNA SOCIETY, RAJKOT - 360 002
      </p>
      <div className="absolute top-4 right-6 text-xs text-primary/80 text-right">
        {copyType ? (
          <p className="font-semibold">{copyType}</p>
        ) : (
          <>
            <p>Original - White</p>
            <p>Duplicate - Yellow</p>
            <p>Triplicate - Pink</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceHeader;
