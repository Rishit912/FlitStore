import React from 'react';
import { FaUsers, FaBoxOpen, FaMoneyBillWave, FaShoppingCart } from 'react-icons/fa';

const cardStyle =
  'flex flex-col items-center justify-center bg-surface dark:bg-surface rounded-xl shadow-md p-6 m-2 min-w-[180px] min-h-[120px] border border-app dark:border-app';
const iconStyle = 'text-3xl mb-2 text-primary';
const labelStyle = 'text-xs font-semibold text-muted uppercase tracking-wider';
const valueStyle = 'text-2xl font-black text-foreground';

const AdminSummary = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mb-10">
      <div className={cardStyle}>
        <FaUsers className={iconStyle} />
        <div className={labelStyle}>Users</div>
        <div className={valueStyle}>{stats?.usersCount ?? 0}</div>
      </div>
      <div className={cardStyle}>
        <FaBoxOpen className={iconStyle} />
        <div className={labelStyle}>Products</div>
        <div className={valueStyle}>{stats?.productsCount ?? 0}</div>
      </div>
      <div className={cardStyle}>
        <FaShoppingCart className={iconStyle} />
        <div className={labelStyle}>Orders</div>
        <div className={valueStyle}>{stats?.ordersCount ?? 0}</div>
      </div>
      <div className={cardStyle}>
        <FaMoneyBillWave className={iconStyle} />
        <div className={labelStyle}>Total Sales</div>
        <div className={valueStyle}>
          ₹{stats?.totalSales ? stats.totalSales.toLocaleString() : '0'}
        </div>
      </div>
    </div>
  );
};

export default AdminSummary;
