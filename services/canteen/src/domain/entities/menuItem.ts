import { MenuItem as MenuItemDTO } from '@campus-os/types';

export class MenuItem implements MenuItemDTO {
  id: string;
  name: string;
  description?: string;
  priceCents: number;
  available: boolean;
  category: string;
  collegeId: string;
  imageUrl?: string;

  constructor(dto: MenuItemDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.description = dto.description;
    this.priceCents = dto.priceCents;
    this.available = dto.available;
    this.category = dto.category;
    this.collegeId = dto.collegeId;
    this.imageUrl = dto.imageUrl;
  }

  markUnavailable() {
    this.available = false;
  }
}
