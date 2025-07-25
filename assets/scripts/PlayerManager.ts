import { _decorator, Component, Node, sys, game, director } from 'cc';

const { ccclass, property } = _decorator;

// 声明微信小游戏全局变量
declare const wx: any;

// 玩家数据结构
export interface PlayerData {
    // 基础信息
    level: number;
    money: number;
    experience: number;
    
    // 车辆相关
    unlockedCars: string[];
    currentCar: string;
    carUpgrades: { [carId: string]: CarUpgrade };
    
    // 关卡相关
    unlockedLevels: string[];
    currentLevel: string;
    levelProgress: { [levelId: string]: LevelProgress };
    
    // 设置
    settings: GameSettings;
    
    // 统计信息
    statistics: GameStatistics;
    
    // 时间戳
    lastSaveTime: number;
    createTime: number;
}

// 车辆升级数据
export interface CarUpgrade {
    engine: number;      // 引擎等级 (0-5)
    tires: number;       // 轮胎等级 (0-5)
    suspension: number;  // 悬挂等级 (0-5)
    nitro: number;       // 氮气等级 (0-5)
}

// 关卡进度数据
export interface LevelProgress {
    stars: number;       // 获得星星数 (0-3)
    completed: boolean;  // 是否完成
    bestTime: number;    // 最佳时间 (毫秒)
    grade: LevelGrade;   // 评级 (S, A, B, C, D, F)
    attempts: number;    // 尝试次数
}

// 评级枚举
export enum LevelGrade {
    S = 'S',
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    F = 'F'
}

// 游戏设置
export interface GameSettings {
    soundVolume: number;     // 音效音量 (0-1)
    musicVolume: number;     // 音乐音量 (0-1)
}

// 游戏统计
export interface GameStatistics {
    totalRaces: number;      // 总比赛次数
    totalWins: number;       // 总胜利次数
    totalMoneyEarned: number; // 总获得金钱
}

// 微信小游戏相关接口
interface WeChatAPI {
    setStorageSync(key: string, data: any): void;
    getStorageSync(key: string): any;
    removeStorageSync(key: string): void;
    cloudCallFunction(name: string, data: any): Promise<any>;
    login(): Promise<any>;
    getUserInfo(): Promise<any>;
}

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    private static _instance: PlayerManager = null!;
    
    // 存储键名
    private readonly STORAGE_KEY = 'TopRacing_PlayerData';
    private readonly STORAGE_KEY_BACKUP = 'TopRacing_PlayerData_Backup';
    
    // 玩家数据
    private _playerData: PlayerData = null!;
    
    // 微信API
    private _wechatAPI: WeChatAPI | null = null;
    private _isWeChatMiniGame = false;
    private _userId: string = '';
    
    // 自动保存相关
    private _autoSaveInterval: number = 30000; // 30秒自动保存
    private _lastAutoSaveTime: number = 0;
    
    // 事件回调
    private _dataChangeCallbacks: ((data: PlayerData) => void)[] = [];
    
    public static get instance(): PlayerManager {
        return PlayerManager._instance;
    }
    
    public get playerData(): PlayerData {
        return this._playerData;
    }
    
    public get isWeChatMiniGame(): boolean {
        return this._isWeChatMiniGame;
    }
    
    public get userId(): string {
        return this._userId;
    }
    
    onLoad() {
        // 单例模式
        if (PlayerManager._instance) {
            this.node.destroy();
            return;
        }
        
        PlayerManager._instance = this;
        
        // 设置为常驻节点，不随场景切换而销毁
        // (this.node as any)._persistNode = true;
        director.addPersistRootNode(this.node);
        
        // 检测运行环境
        this._detectEnvironment();
        this.resetPlayerData();
        
        // 初始化玩家数据
        this._initPlayerData();
        
        // 加载数据
        this.loadPlayerData();
    }
    
    onDestroy() {
        if (PlayerManager._instance === this) {
            PlayerManager._instance = null!;
        }
    }
    
    update(deltaTime: number) {
        // 自动保存检查
        const currentTime = Date.now();
        if (currentTime - this._lastAutoSaveTime > this._autoSaveInterval) {
            // this.savePlayerData();
            this._lastAutoSaveTime = currentTime;
        }
    }
    
    /**
     * 检测运行环境
     */
    private _detectEnvironment() {
        // 检测是否在微信小游戏环境中
        if (typeof wx !== 'undefined' && wx.setStorageSync) {
            this._isWeChatMiniGame = true;
            this._wechatAPI = wx as any;
            console.log('检测到微信小游戏环境');
        } else {
            this._isWeChatMiniGame = false;
            console.log('检测到普通游戏环境');
        }
    }
    
    /**
     * 初始化玩家数据
     */
    private _initPlayerData() {
        this._playerData = {
            level: 1,
            money: 10000,
            experience: 0,
            
            unlockedCars: ['car-1'], // 默认解锁第一辆车
            currentCar: 'car-1',
            carUpgrades: {
                'car-1': {
                    engine: 0,
                    tires: 0,
                    suspension: 0,
                    nitro: 0
                }
            },
            
            unlockedLevels: ['level-1','level-2','level-3'], // 默认只解锁第一关
            currentLevel: 'level-1',
            levelProgress: {
                'level-1': {
                    stars: 0,
                    completed: false,
                    bestTime: 0,
                    grade: LevelGrade.F,
                    attempts: 0
                }
            },
            
            settings: {
                soundVolume: 0.8,
                musicVolume: 0.6,
            },
            
            statistics: {
                totalRaces: 0,
                totalWins: 0,
                totalMoneyEarned: 0,
            },
            
            lastSaveTime: Date.now(),
            createTime: Date.now()
        };
    }
    
    /**
     * 加载玩家数据
     */
    public async loadPlayerData(): Promise<void> {
        try {
            let data: any = null;
            
            if (this._isWeChatMiniGame && this._wechatAPI) {
                // 微信小游戏环境
                try {
                    data = this._wechatAPI.getStorageSync(this.STORAGE_KEY);
                } catch (error) {
                    console.warn('微信存储读取失败，尝试读取备份:', error);
                    data = this._wechatAPI.getStorageSync(this.STORAGE_KEY_BACKUP);
                }
            } else {
                // 普通环境使用localStorage
                const jsonData = sys.localStorage.getItem(this.STORAGE_KEY);
                if (jsonData) {
                    data = JSON.parse(jsonData);
                }
            }
            
            if (data) {
                // 合并数据，保留新字段的默认值
                this._playerData = this._mergePlayerData(this._playerData, data);
                console.log('玩家数据加载成功');
            } else {
                console.log('未找到存档数据，使用默认数据');
            }
            
            // 触发数据变化回调
            this._notifyDataChange();
            
        } catch (error) {
            console.error('加载玩家数据失败:', error);
        }
    }
    
    /**
     * 保存玩家数据
     */
    public async savePlayerData(): Promise<void> {
        try {
            this._playerData.lastSaveTime = Date.now();
            
            if (this._isWeChatMiniGame && this._wechatAPI) {
                // 微信小游戏环境
                try {
                    this._wechatAPI.setStorageSync(this.STORAGE_KEY, this._playerData);
                    // 同时保存备份
                    this._wechatAPI.setStorageSync(this.STORAGE_KEY_BACKUP, this._playerData);
                } catch (error) {
                    console.error('微信存储保存失败:', error);
                    // 尝试云存储
                    await this._saveToWeChatCloud();
                }
            } else {
                // 普通环境使用localStorage
                sys.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._playerData));
            }
            
            console.log('玩家数据保存成功');
            
        } catch (error) {
            console.error('保存玩家数据失败:', error);
        }
    }
    
    /**
     * 合并玩家数据（处理版本兼容性）
     */
    private _mergePlayerData(defaultData: PlayerData, savedData: any): PlayerData {
        const merged = { ...defaultData };
        
        // 递归合并对象
        for (const key in savedData) {
            if (savedData.hasOwnProperty(key)) {
                if (typeof savedData[key] === 'object' && savedData[key] !== null && !Array.isArray(savedData[key])) {
                    merged[key] = { ...merged[key], ...savedData[key] };
                } else {
                    merged[key] = savedData[key];
                }
            }
        }
        
        return merged;
    }
    
    /**
     * 微信云存储保存
     */
    private async _saveToWeChatCloud(): Promise<void> {
        if (!this._wechatAPI || !this._userId) return;
        
        try {
            await this._wechatAPI.cloudCallFunction('savePlayerData', {
                userId: this._userId,
                data: this._playerData
            });
            console.log('数据已保存到微信云存储');
        } catch (error) {
            console.error('微信云存储保存失败:', error);
        }
    }
    
    /**
     * 微信登录
     */
    public async wechatLogin(): Promise<boolean> {
        if (!this._isWeChatMiniGame || !this._wechatAPI) {
            return false;
        }
        
        try {
            const loginResult = await this._wechatAPI.login();
            this._userId = loginResult.code || '';
            
            if (this._userId) {
                console.log('微信登录成功');
                // 登录后尝试从云端加载数据
                await this._loadFromWeChatCloud();
                return true;
            }
        } catch (error) {
            console.error('微信登录失败:', error);
        }
        
        return false;
    }
    
    /**
     * 从微信云端加载数据
     */
    private async _loadFromWeChatCloud(): Promise<void> {
        if (!this._wechatAPI || !this._userId) return;
        
        try {
            const result = await this._wechatAPI.cloudCallFunction('loadPlayerData', {
                userId: this._userId
            });
            
            if (result.data) {
                this._playerData = this._mergePlayerData(this._playerData, result.data);
                this._notifyDataChange();
                console.log('从微信云端加载数据成功');
            }
        } catch (error) {
            console.error('从微信云端加载数据失败:', error);
        }
    }
    
    /**
     * 添加数据变化监听
     */
    public addDataChangeListener(callback: (data: PlayerData) => void): void {
        this._dataChangeCallbacks.push(callback);
    }
    
    /**
     * 移除数据变化监听
     */
    public removeDataChangeListener(callback: (data: PlayerData) => void): void {
        const index = this._dataChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            this._dataChangeCallbacks.splice(index, 1);
        }
    }
    
    /**
     * 通知数据变化
     */
    private _notifyDataChange(): void {
        this._dataChangeCallbacks.forEach(callback => {
            try {
                callback(this._playerData);
            } catch (error) {
                console.error('数据变化回调执行失败:', error);
            }
        });
    }
    
    // ==================== 玩家数据操作方法 ====================
    
    /**
     * 增加金钱
     */
    public addMoney(amount: number): void {
        this._playerData.money += amount;
        this._playerData.statistics.totalMoneyEarned += amount;
        this._notifyDataChange();
    }
    
    /**
     * 消费金钱
     */
    public spendMoney(amount: number): boolean {
        if (this._playerData.money >= amount) {
            this._playerData.money -= amount;
            this._notifyDataChange();
            return true;
        }
        return false;
    }
    
    /**
     * 增加经验
     */
    public addExperience(exp: number): void {
        this._playerData.experience += exp;
        
        // 检查是否升级
        const expNeeded = this._playerData.level * 100; // 每级需要100经验
        if (this._playerData.experience >= expNeeded) {
            this._playerData.level++;
            this._playerData.experience -= expNeeded;
            console.log(`玩家升级到 ${this._playerData.level} 级！`);
        }
        
        this._notifyDataChange();
    }
    
    /**
     * 解锁车辆
     */
    public unlockCar(carId: string): boolean {
        if (this._playerData.unlockedCars.indexOf(carId) === -1) {
            this._playerData.unlockedCars.push(carId);
            this._playerData.carUpgrades[carId] = {
                engine: 0,
                tires: 0,
                suspension: 0,
                nitro: 0
            };
            this._notifyDataChange();
            return true;
        }
        return false;
    }

    /**
     * 检查车辆是否已解锁
     */
    public isCarUnlocked(carId: string): boolean {
        return this._playerData.unlockedCars.indexOf(carId) !== -1;
    }
    
    /**
     * 设置当前车辆
     */
    public setCurrentCar(carId: string): boolean {
        if (this._playerData.unlockedCars.indexOf(carId) !== -1) {
            this._playerData.currentCar = carId;
            this._notifyDataChange();
            return true;
        }
        return false;
    }
    
    /**
     * 升级车辆部件
     */
    public upgradeCarPart(carId: string, part: keyof CarUpgrade): boolean {
        if (!this._playerData.carUpgrades[carId]) return false;
        
        const upgrade = this._playerData.carUpgrades[carId];
        if (upgrade[part] < 5) {
            upgrade[part]++;
            this._notifyDataChange();
            return true;
        }
        return false;
    }
    
    /**
     * 解锁关卡
     */
    public unlockLevel(levelId: string): boolean {
        if (this._playerData.unlockedLevels.indexOf(levelId) === -1) {
            this._playerData.unlockedLevels.push(levelId);
            this._playerData.levelProgress[levelId] = {
                stars: 0,
                completed: false,
                bestTime: 0,
                grade: LevelGrade.F,
                attempts: 0
            };
            this._notifyDataChange();
            return true;
        }
        return false;
    }
    
    /**
     * 更新关卡进度
     */
    public updateLevelProgress(levelId: string, time: number, stars: number): void {
        // 计算评级
        const grade = this.calculateLevelGrade(time, stars);

        if (!this._playerData.levelProgress[levelId]) {
            this._playerData.levelProgress[levelId] = {
                stars: stars,
                completed: true,
                bestTime: time,
                grade: grade,
                attempts: 1
            };
        } else {
            const progress = this._playerData.levelProgress[levelId];

            // 更新最佳成绩
            if (stars > progress.stars || (stars === progress.stars && time < progress.bestTime)) {
                progress.stars = stars;
                progress.bestTime = time;
                progress.grade = grade;
            }

            progress.completed = true;
            progress.attempts++;
        }

        // 检查是否解锁下一关卡
        this.checkAndUnlockNextLevel(levelId);

        this._notifyDataChange();
    }

    /**
     * 计算关卡评级
     */
    private calculateLevelGrade(time: number, stars: number): LevelGrade {
        // 基于星星数和时间计算评级
        if (stars === 3) {
            if (time <= 30000) return LevelGrade.S;      // 30秒内3星 = S
            else if (time <= 45000) return LevelGrade.A; // 45秒内3星 = A
            else return LevelGrade.B;                     // 超过45秒3星 = B
        } else if (stars === 2) {
            if (time <= 60000) return LevelGrade.C;      // 60秒内2星 = C
            else return LevelGrade.D;                     // 超过60秒2星 = D
        } else if (stars === 1) {
            return LevelGrade.D;                          // 1星 = D
        } else {
            return LevelGrade.F;                          // 0星 = F
        }
    }

    /**
     * 检查并解锁下一关卡
     */
    private checkAndUnlockNextLevel(currentLevelId: string): void {
        const currentProgress = this._playerData.levelProgress[currentLevelId];

        // 只有评级在D及以上时才解锁下一关
        if (currentProgress && this.isGradePassable(currentProgress.grade)) {
            const nextLevelId = this.getNextLevelId(currentLevelId);
            if (nextLevelId && this._playerData.unlockedLevels.indexOf(nextLevelId) === -1) {
                this.unlockLevel(nextLevelId);
                console.log(`解锁新关卡: ${nextLevelId}`);
            }
        }
    }

    /**
     * 检查评级是否达到解锁要求
     */
    private isGradePassable(grade: LevelGrade): boolean {
        return grade !== LevelGrade.F; // D及以上都可以解锁下一关
    }

    /**
     * 获取下一关卡ID
     */
    private getNextLevelId(currentLevelId: string): string | null {
        // 假设关卡命名为 level-1, level-2, level-3...
        const match = currentLevelId.match(/level-(\d+)/);
        if (match) {
            const currentNumber = parseInt(match[1]);
            return `level-${currentNumber + 1}`;
        }
        return null;
    }

    /**
     * 获取关卡进度信息
     */
    public getLevelProgress(levelId: string): LevelProgress | null {
        return this._playerData.levelProgress[levelId] || null;
    }

    /**
     * 检查关卡是否已解锁
     */
    public isLevelUnlocked(levelId: string): boolean {
        return this._playerData.unlockedLevels.indexOf(levelId) !== -1;
    }

    /**
     * 获取关卡评级文本
     */
    public getLevelGradeText(levelId: string): string {
        const progress = this.getLevelProgress(levelId);
        if (!progress || !progress.completed) {
            return '';
        }
        return progress.grade;
    }

    /**
     * 获取关卡评级颜色
     */
    public getLevelGradeColor(grade: LevelGrade): string {
        switch (grade) {
            case LevelGrade.S: return '#FFD700'; // 金色
            case LevelGrade.A: return '#C0C0C0'; // 银色
            case LevelGrade.B: return '#CD7F32'; // 铜色
            case LevelGrade.C: return '#90EE90'; // 浅绿色
            case LevelGrade.D: return '#87CEEB'; // 天蓝色
            case LevelGrade.F: return '#FF6B6B'; // 红色
            default: return '#FFFFFF'; // 白色
        }
    }
    
    /**
     * 更新游戏设置
     */
    public updateSettings(settings: Partial<GameSettings>): void {
        this._playerData.settings = { ...this._playerData.settings, ...settings };
        this._notifyDataChange();
    }
    
    /**
     * 更新统计数据
     */
    public updateStatistics(updates: Partial<GameStatistics>): void {
        this._playerData.statistics = { ...this._playerData.statistics, ...updates };
        this._notifyDataChange();
    }
    
    /**
     * 重置玩家数据
     */
    public resetPlayerData(): void {
        this._initPlayerData();
        this.savePlayerData();
        this._notifyDataChange();
        console.log('玩家数据已重置');
    }
    
    /**
     * 导出玩家数据（用于调试）
     */
    public exportPlayerData(): string {
        return JSON.stringify(this._playerData, null, 2);
    }
    
    /**
     * 导入玩家数据（用于调试）
     */
    public importPlayerData(jsonData: string): boolean {
        try {
            const data = JSON.parse(jsonData);
            this._playerData = this._mergePlayerData(this._playerData, data);
            this.savePlayerData();
            this._notifyDataChange();
            console.log('玩家数据导入成功');
            return true;
        } catch (error) {
            console.error('玩家数据导入失败:', error);
            return false;
        }
    }
} 