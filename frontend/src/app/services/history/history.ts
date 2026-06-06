import { Injectable } from '@angular/core';
import { HistoryEntry, OrganizeResult } from '../../models/asset.model';

const STORAGE_KEY = 'asset_organizer_history';
const MAX_HISTORY = 5;

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  // Lấy lịch sử mới nhất từ localStorage
  getAll(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Tự động xóa entry cũ nhất nếu đã đủ MAX_HISTORY (tối đa 5 entry)
  save(input: string, result: OrganizeResult): HistoryEntry {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      label: input.trim().substring(0, 50) + (input.length > 50 ? '...' : ''),
      input,
      result,
      createdAt: new Date().toISOString(),
    };

    const history = this.getAll();

    // Thêm mới lên đầu
    history.unshift(entry);

    // Giữ tối đa MAX_HISTORY entries
    const trimmed = history.slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return entry;
  }

  // ─── Xóa 1 entry theo id ─────────────────────────────────────────────
  delete(id: string): void {
    const updated = this.getAll().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // ─── Xóa toàn bộ lịch sử ─────────────────────────────────────────────
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
