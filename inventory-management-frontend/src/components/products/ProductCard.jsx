import React from 'react';
import { Card } from '../common/Card';
import { Edit, Trash2, MapPin } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers'; // Ensure this is imported

export const ProductCard = ({ product, onEdit, onDelete, isAdmin }) => {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{product.sku}</p>
          {product.location && (
            <p className="text-xs text-gray-400 flex items-center mb-2">
              <MapPin className="w-3 h-3 mr-1" /> {product.location}
            </p>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${product.isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            Stock: {product.quantityOnHand}
          </span>
        </div>
        <div className="text-right">
          {/* <--- CHANGED: Uses formatCurrency (₹) */}
          <p className="font-bold text-lg">{formatCurrency(product.unitPrice)}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end gap-2 pt-4 border-t">
        <button onClick={() => onEdit(product)} className="p-2 hover:bg-gray-100 rounded text-gray-600">
          <Edit className="w-4 h-4" />
        </button>
        {isAdmin && (
          <button onClick={() => onDelete(product.id)} className="p-2 hover:bg-red-50 rounded text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
};