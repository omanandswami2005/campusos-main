import { MenuItem as MenuItemDTO } from '@campus-os/types';

export class MenuItem implements MenuItemDTO {
  id: string;
  name: string;
  priceCents: number;
  available: boolean;

  constructor(dto: MenuItemDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.priceCents = dto.priceCents;
    this.available = dto.available;
  }

  markUnavailable() {
    this.available = false;
  }
}
