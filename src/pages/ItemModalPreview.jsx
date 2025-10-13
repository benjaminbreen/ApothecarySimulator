/**
 * Item Modal Preview Page
 *
 * Standalone page to preview the enhanced inventory item modal.
 * Navigate to /item-modal-preview to see it in action.
 */

import React, { useState } from 'react';
import ItemModalEnhanced_MOCKUP from '../components/ItemModalEnhanced_MOCKUP';
import { QUALITY, RARITY } from '../core/systems/itemRarity';

export default function ItemModalPreview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sample items for testing
  const sampleItems = [
    {
      id: 3,
      name: 'Opium',
      latinName: 'Opium crudum',
      spanishName: 'Opio Crudo',
      price: 6,
      quantity: 3,
      humoralQualities: 'Cold & Dry',
      medicinalEffects: 'Powerful pain relief, sedative, and treatment for cough and diarrhea.',
      description: 'Dried latex obtained from the opium poppy. Most potent reliever of pain known.',
      emoji: '⚫️',
      citation: 'Benjamin Breen, *The Age of Intoxication* (Penn, 2019)',
      pdf: 'opium.pdf',
      quality: QUALITY.HIGH_QUALITY,
      image: '/portraits/opium.jpg'
    },
    {
      id: 17,
      name: 'Bezoar Stone',
      latinName: 'Bezoar',
      spanishName: 'Piedra Bezoar',
      price: 50,
      quantity: 1,
      humoralQualities: 'Cold & Dry',
      medicinalEffects: 'Antidote to poisons, treats fevers, and balances the humors.',
      description: 'A rare and prized stone found in the stomachs of certain animals, known for its use as a universal antidote.',
      emoji: '🪨',
      pdf: 'bezoar.pdf',
      citation: 'José de Acosta, *Natural and Moral History of the Indies* (1604), p. 293. Link: https://www.google.com/books/edition/The_Natural_Moral_History_of_the_Indies/BXwRAwAAQBAJ?hl=en&gbpv=1&dq=bezoar&pg=PA293&printsec=frontcover',
      quality: QUALITY.STANDARD,
      rarity: RARITY.RARE,
      image: '/portraits/bezoar.jpg'
    },
    {
      id: 12,
      name: 'Sugar',
      latinName: 'Saccharum',
      spanishName: 'Azúcar',
      price: 5,
      quantity: 4,
      humoralQualities: 'Warm & Dry',
      medicinalEffects: 'Used to soothe coughs, treat wounds, and improve digestion.',
      description: 'Sugar shipped from Seville. Useful for confectioning with noxious medicines to make juleps and treacles.',
      emoji: '🍬',
      pdf: 'sugar.pdf',
      citation: 'Jean de Renou, *A Medicinal Dispensatory Containing the Whole Body of Physick,* translated by Richard Tomlinson (London, 1657)',
      quality: QUALITY.EXCEPTIONAL,
      image: '/portraits/sugar.jpg'
    },
    {
      id: 23,
      name: 'Crocus Metallorum',
      latinName: 'Crocus Metallorum',
      spanishName: 'Po de quintilio',
      price: 1,
      quantity: 2,
      humoralQualities: 'Cold & Dry',
      medicinalEffects: 'Powerful purgative used to evacuate humors from both above and below.',
      description: 'A reddish alchemical powder made from antimony, commonly used as a purgative taken with wine or sugar. Toxic.',
      emoji: '☄️',
      pdf: 'crocusmetallorum.pdf',
      citation: 'Nicolas Lémery, A Course of Chymistry (London, 1686), 173-75, url: https://www.google.com/books/edition/A_Course_of_Chymistry/Ibxc-ttw8_oC?hl=en&gbpv=1&pg=PA217&printsec=frontcover',
      quality: QUALITY.STANDARD,
      rarity: RARITY.SCARCE,
      image: '/portraits/crocusmetallorum.jpg'
    }
  ];

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8" style={{
      background: 'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 50%, #faf8f3 100%)'
    }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: '#3d2f24'
        }}>
          Enhanced Inventory Modal Preview
        </h1>
        <p className="text-lg" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#8b7a6a'
        }}>
          Click on any item to preview the modal. Test all tabs and expandable sections.
        </p>
      </div>

      {/* Sample Items Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {sampleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => openModal(item)}
            className="p-4 rounded-xl text-left transition-all duration-200 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 250, 247, 0.9) 100%)',
              border: '1.5px solid rgba(180, 175, 165, 0.5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer'
            }}
          >
            <div className="text-4xl mb-2 text-center">{item.emoji}</div>
            <h3 className="text-sm font-bold text-center" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#3d2f24'
            }}>
              {item.name}
            </h3>
            <p className="text-xs text-center mt-1" style={{
              fontFamily: "'Inter', sans-serif",
              color: '#8b7a6a'
            }}>
              {item.price} reales
            </p>
          </button>
        ))}
      </div>

      {/* Feature List */}
      <div className="max-w-6xl mx-auto mt-12 p-6 rounded-xl" style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05))',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h2 className="text-2xl font-bold mb-4" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          color: '#1e40af'
        }}>
          ✨ Features to Test
        </h2>
        <ul className="space-y-2 text-sm" style={{
          fontFamily: "'Inter', sans-serif",
          color: '#1e3a8a'
        }}>
          <li>✓ <strong>Overview Tab:</strong> Hero image, rarity/quality badges, quick facts</li>
          <li>✓ <strong>Properties Tab:</strong> Expandable sections for humoral qualities, effects, preparations</li>
          <li>✓ <strong>History Tab:</strong> Historical context, trade routes, knowledge traditions</li>
          <li>✓ <strong>Sources Tab:</strong> Citations, PDF link (clickable), further reading</li>
          <li>✓ <strong>Rarity Colors:</strong> Green (common), Blue (scarce), Purple (rare), Pink (legendary)</li>
          <li>✓ <strong>Quality Badges:</strong> Purple badges for High Quality/Exceptional items</li>
          <li>✓ <strong>Glassomorphic Design:</strong> Matches inventory panel aesthetic</li>
          <li>✓ <strong>Progressive Disclosure:</strong> Expandable sections reward exploration</li>
        </ul>
      </div>

      {/* Modal */}
      <ItemModalEnhanced_MOCKUP
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
