const express = require('express');
const router = express.Router();
const { convertAmount, applyCardFee } = require('../services/currencyService');

// Split bill endpoint
router.post('/split-bill', async (req, res) => {
  try {
    const { 
      totalAmount, 
      currency, 
      participants, 
      payerCardFeePercentage // User inputs their credit card fee (like 3, 5, 0, etc)
    } = req.body;
    
    // Apply card fee to total if payer has one
    const amountWithFee = applyCardFee(totalAmount, payerCardFeePercentage);
    
    // Split among participants
    const amountPerPerson = amountWithFee / participants.length;
    
    // Convert to each person's preferred currency
    const splits = await Promise.all(
      participants.map(async (participant) => {
        const convertedAmount = await convertAmount(
          amountPerPerson,
          currency,
          participant.preferredCurrency
        );
        
        return {
          userId: participant.id,
          name: participant.name,
          amountOwed: parseFloat(convertedAmount.toFixed(2)),
          currency: participant.preferredCurrency
        };
      })
    );
    
    res.json({ 
      success: true,
      originalAmount: totalAmount,
      totalWithFee: parseFloat(amountWithFee.toFixed(2)),
      cardFeePercentage: payerCardFeePercentage || 0,
      splits 
    });
  } 
  catch (error) {
    console.error('Split bill error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to split bill' 
    });
  }
});

module.exports = router;