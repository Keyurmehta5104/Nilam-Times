interface InvoiceHeaderProps {
  copyType?: string;
}

const InvoiceHeader = ({ copyType }: InvoiceHeaderProps) => {
  return (
    <div className="invoice-header">
      <div className="invoice-frame">
        <div className="invoice-header-copy">{copyType || "Original"}</div>
        <div className="invoice-header-main">
          <h1 className="invoice-title">NILAM TIMES</h1>
          <div className="invoice-header-divider" />
          <p className="invoice-subtitle">
            4-PATELNAGAR, 1-SADBHAVNA SOCIETY, RAJKOT - 360 002
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
