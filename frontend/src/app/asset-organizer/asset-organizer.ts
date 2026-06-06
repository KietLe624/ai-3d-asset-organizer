import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
// service
import { AssetService } from '../services/asset/asset';
import { HistoryService } from '../services/history/history';
// model
import { OrganizeResult, HistoryEntry } from '../models/asset.model';
@Component({
  selector: 'app-asset-organizer',
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-organizer.html',
  styleUrl: './asset-organizer.scss',
})
export class AssetOrganizerComponent implements OnInit {
  // State quản lý UI
  assetInput: string = ''; // Nội dung textarea
  isLoading: boolean = false; // Hiển thị spinner
  errorMessage: string = ''; // Thông báo lỗi
  result: OrganizeResult | null = null; // Kết quả từ API
  activeTab: 'table' | 'json' = 'table'; // Tab hiển thị kết quả

  // State quản lý lịch sử
  history: HistoryEntry[] = []; // Danh sách lịch sử
  showHistory: boolean = false
  activeHistoryId: string | null = null; // entry đang xem trong lịch sử

  // Ví dụ mẫu để user tham khảo
  readonly exampleInput = `Phòng khách, phòng ngủ master, phòng ngủ 2, phòng ngủ 3,
bếp, phòng ăn, nhà tắm master, nhà tắm chung,
ban công, kho, phòng giặt, sảnh thang máy`;

  constructor(
    private assetService: AssetService,
    private cdr: ChangeDetectorRef,
    private historyService: HistoryService
  ) { }

  ngOnInit(): void {
    this.history = this.historyService.getAll();
  }

  // Load ví dụ mẫu
  loadExample(): void {
    this.assetInput = this.exampleInput;
    this.errorMessage = '';
  }
  // xoá input và kết quả
  clearAll(): void {
    this.assetInput = '';
    this.errorMessage = '';
    this.result = null;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  // gọi API và lưu kết quả và localStorage
  onSubmit(): void {
    if (!this.assetInput || this.assetInput.trim().length === 0) {
      this.errorMessage = 'Vui lòng nhập danh sách asset trước khi phân tích';
      return;
    }

    this.errorMessage = '';
    this.result = null;
    this.isLoading = true;
    this.activeHistoryId = null;

    this.assetService.organizeAssets(this.assetInput).subscribe({
      next: (response) => {
        this.result = response.data;
        this.isLoading = false;

        // ── Lưu vào localStorage sau khi có kết quả ─────────────────────
        const saved = this.historyService.save(this.assetInput, response.data);
        this.history = this.historyService.getAll(); // refresh list
        this.activeHistoryId = saved.id;

        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ─── Load 1 entry từ lịch sử vào form và kết quả ─────────────────────
  loadFromHistory(entry: HistoryEntry): void {
    this.assetInput = entry.input;
    this.result = entry.result;
    this.errorMessage = '';
    this.activeHistoryId = entry.id;
    this.showHistory = false; // đóng panel sau khi chọn

    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // ─── Xóa 1 entry khỏi lịch sử ────────────────────────────────────────
  deleteHistory(event: Event, id: string): void {
    event.stopPropagation(); // không trigger loadFromHistory
    this.historyService.delete(id);
    this.history = this.historyService.getAll();

    // Nếu đang xem entry bị xóa thì clear kết quả
    if (this.activeHistoryId === id) {
      this.result = null;
      this.activeHistoryId = null;
    }
  }

  // ─── Xóa toàn bộ lịch sử ─────────────────────────────────────────────
  clearHistory(): void {
    if (!confirm('Xóa toàn bộ lịch sử?')) return;
    this.historyService.clearAll();
    this.history = [];
    this.result = null;
    this.activeHistoryId = null;
  }

  // ─── Format timestamp hiển thị ────────────────────────────────────────
  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // lấy danh sách keys của object
  objectKeys(obj: Record<string, unknown>): string[] {
    return Object.keys(obj);
  }

  // convert to JSON
  getResultJson(): string {
    return JSON.stringify(this.result, null, 2);
  }

  // copy result
  copyJson(): void {
    navigator.clipboard.writeText(this.getResultJson()).then(() => {
      alert('Đã copy JSON vào clipboard!');
    });
  }
}
