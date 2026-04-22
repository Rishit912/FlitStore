import React from 'react';

const AccountTypeStep = ({ accountType, setAccountType, onNext, onBack }) => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-center text-foreground mb-6">Choose Account Type</h2>
      <div className="flex flex-col gap-6">
        <button
          className={`app-btn w-full py-4 font-bold text-lg ${accountType === 'buyer' ? 'ring-4 ring-primary/30' : ''}`}
          type="button"
          onClick={() => setAccountType('buyer')}
        >
          I am a Buyer
        </button>
        <button
          className={`app-btn w-full py-4 font-bold text-lg ${accountType === 'retailer' ? 'ring-4 ring-primary/30' : ''}`}
          type="button"
          onClick={() => setAccountType('retailer')}
        >
          I am a Retailer (I want to sell)
        </button>
      </div>
      <div className="flex justify-between mt-8">
        <button type="button" className="app-btn px-8" onClick={onBack}>Back</button>
        <button type="button" className="app-btn px-8" onClick={onNext} disabled={!accountType}>Next</button>
      </div>
    </div>
  );
};

export default AccountTypeStep;
