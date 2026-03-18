import React from "react";
import { useRadixPrices } from "@/hooks/useRadixPrices";
import { useWalletBalances, WalletAsset } from "@/hooks/useWalletBalances";
import { useRadixWallet } from "@/providers/RadixProvider";

const WalletAssets: React.FC = () => {
  const { connected } = useRadixWallet();
  const { tokens, loading: pricesLoading } = useRadixPrices();
  const { assets, loading: balancesLoading, error } = useWalletBalances(tokens);

// Removed: message asking to connect wallet

  if (pricesLoading || balancesLoading) {
    return (
      <div className="wallet-assets">
        <div className="wallet-message">
          <p>Loading wallet assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-assets">
        <div className="wallet-message error">
          <p>Error loading assets: {error}</p>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="wallet-assets">
        <div className="wallet-message">
          <p>No assets found in your wallet</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatNumber(change, 2)}%`;
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.valueUSD, 0);

  return (
    <div className="wallet-assets">
      <div className="wallet-header">
        <h2>My Assets</h2>
        <div className="total-value">
          <span className="label">Total Value:</span>
          <span className="value">${formatNumber(totalValue)}</span>
        </div>
      </div>

      <div className="assets-list">
        {assets.map((asset: WalletAsset) => (
          <div key={asset.resourceAddress} className="asset-card">
            <div className="asset-header">
              <div className="asset-info">
                {asset.iconUrl && (
                  <img
                    src={asset.iconUrl}
                    alt={asset.symbol}
                    className="asset-icon"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="asset-details">
                  <h3 className="asset-symbol">{asset.symbol}</h3>
                  <p className="asset-name">{asset.name}</p>
                </div>
              </div>
              <div className="asset-value">
                <p className="value-usd">${formatNumber(asset.valueUSD)}</p>
                <p className="amount">{formatNumber(asset.amount, 4)} {asset.symbol}</p>
              </div>
            </div>

            <div className="asset-stats">
              <div className="stat">
                <span className="stat-label">Price USD:</span>
                <span className="stat-value">${formatNumber(asset.priceUSD, 6)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Price XRD:</span>
                <span className="stat-value">{formatNumber(asset.priceXRD, 6)} XRD</span>
              </div>
              <div className="stat">
                <span className="stat-label">24h Change:</span>
                <span className={`stat-value ${asset.change24hUSD >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(asset.change24hUSD)}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">7d Change:</span>
                <span className={`stat-value ${asset.change7dUSD >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(asset.change7dUSD)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .wallet-assets {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }

        .wallet-header h2 {
          font-size: 28px;
          font-weight: bold;
          color: #fff;
        }

        .total-value {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .total-value .label {
          font-size: 14px;
          color: #888;
          margin-bottom: 5px;
        }

        .total-value .value {
          font-size: 32px;
          font-weight: bold;
          color: #4ade80;
        }

        .wallet-message {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #888;
        }

        .wallet-message.error {
          color: #ef4444;
        }

        .assets-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .asset-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .asset-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border-color: #4ade80;
        }

        .asset-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .asset-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .asset-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #4ade80;
        }

        .asset-details h3 {
          font-size: 20px;
          font-weight: bold;
          color: #fff;
          margin: 0 0 5px 0;
        }

        .asset-details p {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .asset-value {
          text-align: right;
        }

        .value-usd {
          font-size: 24px;
          font-weight: bold;
          color: #4ade80;
          margin: 0 0 5px 0;
        }

        .amount {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .asset-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          padding-top: 15px;
          border-top: 1px solid #333;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .stat-value.positive {
          color: #4ade80;
        }

        .stat-value.negative {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .wallet-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .total-value {
            align-items: flex-start;
          }

          .assets-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletAssets;
