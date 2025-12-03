/**
 * AdditionalDirections Component
 * Displays walking directions from the nearest road node to a POI
 * Shows when user reaches the end of the calculated route
 */

import React from 'react';
import { RoadNode } from './roadSystem';

interface AdditionalDirectionsProps {
  destination: RoadNode;
  onClose: () => void;
  mobileMode?: boolean;
}

const AdditionalDirections: React.FC<AdditionalDirectionsProps> = ({
  destination,
  onClose,
  mobileMode = false,
}) => {
  // Only render if there are additional directions
  if (!destination.additionalDirections || destination.additionalDirections.trim() === '') {
    return null;
  }

  return (
    <div
      className={`additional-directions ${mobileMode ? 'mobile' : 'desktop'}`}
      style={{
        position: 'fixed',
        bottom: mobileMode ? '20px' : '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        padding: '24px',
        maxWidth: mobileMode ? 'calc(100% - 40px)' : '480px',
        width: mobileMode ? 'calc(100% - 40px)' : 'auto',
        zIndex: 2000,
        border: '2px solid #4CAF50',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            🚶
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#333333',
              }}
            >
              You've arrived!
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#666666',
              }}
            >
              Final walking directions
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#999999',
            lineHeight: 1,
            padding: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#333333')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Destination Name */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>
          Destination
        </div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#333333' }}>
          {destination.name}
        </div>
      </div>

      {/* Walking Directions */}
      <div
        style={{
          backgroundColor: '#FFF3E0',
          border: '1px solid #FFB74D',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px', flexShrink: 0 }}>📍</span>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#E65100',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Walking Directions
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#333333',
              }}
            >
              {destination.additionalDirections}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = '#45a049')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = '#4CAF50')
        }
      >
        Got it!
      </button>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .additional-directions {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }
      `}</style>
    </div>
  );
};

export default AdditionalDirections;
