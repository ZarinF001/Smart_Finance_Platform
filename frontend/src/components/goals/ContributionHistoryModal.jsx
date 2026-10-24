import React, { useState, useEffect } from 'react';
import { History, Calendar, DollarSign, Loader2, Inbox } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import savingsGoalService from '../../services/savingsGoalService.js';
import { formatBDT, formatDate } from '../../utils/currency.js';
import EmptyState from '../common/EmptyState.jsx';

export const ContributionHistoryModal = ({
  isOpen,
  onClose,
  goal,
}) => {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!goal?._id) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await savingsGoalService.getContributions(goal._id, { limit: 50 });
        if (isMounted) {
          setContributions(res.items || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load deposit history');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isOpen && goal?._id) {
      fetchHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, goal]);

  if (!goal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contribution History"
      subtitle={`Deposit records for "${goal.name}"`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Goal Summary Mini-Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Saved to Date</p>
            <p className="text-lg font-extrabold text-emerald-600">
              {formatBDT(goal.totalSaved || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Target Amount</p>
            <p className="text-sm font-bold text-slate-800">
              {formatBDT(goal.targetAmount)}
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mb-2" />
            <p className="text-xs">Loading deposits...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        ) : contributions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No deposits recorded yet"
            description="No savings contributions have been logged for this goal yet."
          />
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
            {contributions.map((c) => (
              <div
                key={c._id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(c.date)}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.description || <span className="italic text-slate-300">No memo provided</span>}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600">
                    +{formatBDT(c.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ContributionHistoryModal;
