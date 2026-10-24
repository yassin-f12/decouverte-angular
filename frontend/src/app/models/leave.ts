export type LeaveType = 'paid' | 'rtt' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

// Une demande de congé, telle que renvoyée par GET /api/leaves.
export interface Leave {
  id: number;
  employeeId: number;
  type: LeaveType;
  startDate: string; // format AAAA-MM-JJ
  endDate: string;
  days: number; // jours ouvrés, calculés par le serveur
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

// Ce que le client envoie pour créer une demande : le serveur fixe le reste.
export interface NewLeave {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

// Libellés affichés à l'utilisateur.
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  paid: 'Congés payés',
  rtt: 'RTT',
  unpaid: 'Sans solde',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'En attente',
  approved: 'Acceptée',
  rejected: 'Refusée',
};
