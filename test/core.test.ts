import { describe, it, expect, beforeEach } from 'vitest';
import { MountPointsManager } from '../src/system/managers/MountPointsManager';
import type { MountPoint } from '../src/types/types';
import type { System } from '../src/system/System';

// Мок для System
const mockSystem = {
  configs: {
    loadEntityConfig: async () => ({ items: [] }),
    saveEntityConfig: async () => {},
  },
} as unknown as System;

describe('MountPointsManager', () => {
  let manager: MountPointsManager;

  beforeEach(() => {
    manager = new MountPointsManager(mockSystem, '/test/root');
  });

  describe('circular mount points detection', () => {
    it('should allow valid mount points', async () => {
      const point1: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      const point2: MountPoint = {
        src: { type: 'root', path: '/src2' },
        dest: { type: 'external', path: '/dest2' },
      };

      // Эти точки не должны создавать цикл
      await expect(manager.registerMountPoint(point1)).resolves.not.toThrow();
      await expect(manager.registerMountPoint(point2)).resolves.not.toThrow();
    });

    it('should detect direct circular mount points', async () => {
      const point1: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      const point2: MountPoint = {
        src: { type: 'external', path: '/dest1' },
        dest: { type: 'root', path: '/src1' },
      };

      // Регистрируем первую точку
      await manager.registerMountPoint(point1);

      // Вторая точка создает прямой цикл
      await expect(manager.registerMountPoint(point2)).rejects.toThrow(
        'Circular mount point detected'
      );
    });

    it('should detect indirect circular mount points', async () => {
      const point1: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      const point2: MountPoint = {
        src: { type: 'external', path: '/dest1' },
        dest: { type: 'external', path: '/dest2' },
      };

      const point3: MountPoint = {
        src: { type: 'external', path: '/dest2' },
        dest: { type: 'root', path: '/src1' },
      };

      // Регистрируем первые две точки
      await manager.registerMountPoint(point1);
      await manager.registerMountPoint(point2);

      // Третья точка создает непрямой цикл: /src1 -> /dest1 -> /dest2 -> /src1
      await expect(manager.registerMountPoint(point3)).rejects.toThrow(
        'Circular mount point detected'
      );
    });

    it('should detect complex circular mount points', async () => {
      const point1: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      const point2: MountPoint = {
        src: { type: 'external', path: '/dest1' },
        dest: { type: 'external', path: '/dest2' },
      };

      const point3: MountPoint = {
        src: { type: 'external', path: '/dest2' },
        dest: { type: 'external', path: '/dest3' },
      };

      const point4: MountPoint = {
        src: { type: 'external', path: '/dest3' },
        dest: { type: 'root', path: '/src1' },
      };

      // Регистрируем первые три точки
      await manager.registerMountPoint(point1);
      await manager.registerMountPoint(point2);
      await manager.registerMountPoint(point3);

      // Четвертая точка создает сложный цикл: /src1 -> /dest1 -> /dest2 -> /dest3 -> /src1
      await expect(manager.registerMountPoint(point4)).rejects.toThrow(
        'Circular mount point detected'
      );
    });

    it('should allow non-circular mount points with same destinations', async () => {
      const point1: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      const point2: MountPoint = {
        src: { type: 'root', path: '/src2' },
        dest: { type: 'external', path: '/dest1' },
      };

      // Эти точки не создают цикл, хотя у них одинаковая destination
      await expect(manager.registerMountPoint(point1)).resolves.not.toThrow();
      await expect(manager.registerMountPoint(point2)).resolves.not.toThrow();
    });

    it('should prevent root to root mount points', async () => {
      const point: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'root', path: '/dest1' },
      };

      await expect(manager.registerMountPoint(point)).rejects.toThrow(
        'Root mount point cannot be both source and destination'
      );
    });

    it('should prevent duplicate mount points', async () => {
      const point: MountPoint = {
        src: { type: 'root', path: '/src1' },
        dest: { type: 'external', path: '/dest1' },
      };

      await manager.registerMountPoint(point);

      await expect(manager.registerMountPoint(point)).rejects.toThrow(
        'Mount point already exists'
      );
    });

    it('should detect circular mount points in existing configuration', async () => {
      // Создаем менеджер с уже существующими циклическими точками
      const circularMountPoints: MountPoint[] = [
        {
          src: { type: 'root', path: '/src1' },
          dest: { type: 'external', path: '/dest1' },
        },
        {
          src: { type: 'external', path: '/dest1' },
          dest: { type: 'root', path: '/src1' },
        },
      ];

      // Мокаем загрузку конфигурации с циклическими точками
      const mockSystemWithCircular = {
        configs: {
          loadEntityConfig: async () => ({ items: circularMountPoints }),
          saveEntityConfig: async () => {},
        },
      } as unknown as System;

      const managerWithCircular = new MountPointsManager(
        mockSystemWithCircular,
        '/test/root'
      );

      // Инициализируем менеджер
      await managerWithCircular.init();

      // Проверяем, что метод обнаруживает циклы
      expect(managerWithCircular.hasCircularMountPoints()).toBe(true);
    });

    it('should not detect circular mount points in valid configuration', async () => {
      // Создаем менеджер с валидными точками
      const validMountPoints: MountPoint[] = [
        {
          src: { type: 'root', path: '/src1' },
          dest: { type: 'external', path: '/dest1' },
        },
        {
          src: { type: 'root', path: '/src2' },
          dest: { type: 'external', path: '/dest2' },
        },
      ];

      // Мокаем загрузку конфигурации с валидными точками
      const mockSystemWithValid = {
        configs: {
          loadEntityConfig: async () => ({ items: validMountPoints }),
          saveEntityConfig: async () => {},
        },
      } as unknown as System;

      const managerWithValid = new MountPointsManager(
        mockSystemWithValid,
        '/test/root'
      );

      // Инициализируем менеджер
      await managerWithValid.init();

      // Проверяем, что метод не обнаруживает циклы
      expect(managerWithValid.hasCircularMountPoints()).toBe(false);
    });
  });
});

describe('core', () => {
  it('should be true', () => {
    expect(true).toBe(true);
  });
});
