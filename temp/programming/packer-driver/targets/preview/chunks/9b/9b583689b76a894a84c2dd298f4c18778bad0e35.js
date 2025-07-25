System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Vec3, RigidBody2D, ERigidBody2DType, BoxCollider2D, Contact2DType, ProgressBar, Sprite, SpriteFrame, tween, player, GameManager, SoundManager, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _crd, ccclass, property, AIPlayer;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfplayer(extras) {
    _reporterNs.report("player", "./player", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameManager(extras) {
    _reporterNs.report("GameManager", "./GameManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSoundManager(extras) {
    _reporterNs.report("SoundManager", "./SoundManager", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
      RigidBody2D = _cc.RigidBody2D;
      ERigidBody2DType = _cc.ERigidBody2DType;
      BoxCollider2D = _cc.BoxCollider2D;
      Contact2DType = _cc.Contact2DType;
      ProgressBar = _cc.ProgressBar;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      tween = _cc.tween;
    }, function (_unresolved_2) {
      player = _unresolved_2.player;
    }, function (_unresolved_3) {
      GameManager = _unresolved_3.GameManager;
    }, function (_unresolved_4) {
      SoundManager = _unresolved_4.SoundManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ff4775+zu9CyIBPyXgDNpx7", "AIPlayer", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Node', 'Vec2', 'Vec3', 'RigidBody2D', 'ERigidBody2DType', 'math', 'BoxCollider2D', 'Contact2DType', 'ProgressBar', 'Sprite', 'SpriteFrame', 'tween']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("AIPlayer", AIPlayer = (_dec = ccclass('AIPlayer'), _dec2 = property(ProgressBar), _dec3 = property(SpriteFrame), _dec(_class = (_class2 = class AIPlayer extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "maxSpeed", _descriptor, this);

          _initializerDefineProperty(this, "acceleration", _descriptor2, this);

          _initializerDefineProperty(this, "brakeDeceleration", _descriptor3, this);

          _initializerDefineProperty(this, "turnSpeed", _descriptor4, this);

          _initializerDefineProperty(this, "friction", _descriptor5, this);

          _initializerDefineProperty(this, "initAngle", _descriptor6, this);

          _initializerDefineProperty(this, "maxHealth", _descriptor7, this);

          // 最大生命值
          _initializerDefineProperty(this, "healthBar", _descriptor8, this);

          // 血条UI组件
          _initializerDefineProperty(this, "destroyedSprite", _descriptor9, this);

          // 摧毁状态的精灵图
          _initializerDefineProperty(this, "removeDelay", _descriptor10, this);

          // 摧毁后移除节点的延迟时间（秒）
          this._rigidBody = null;
          this._direction = 0;
          // -1:左, 0:不转, 1:右
          this._accel = 0;
          // -1:刹车, 0:无, 1:加速
          this._angle = 0;
          this._targetAngle = 0;
          this._lastValidPosition = new Vec2();
          this._currentHealth = 100;
          // 当前生命值
          // 摧毁相关
          this._isDestroyed = false;
          // 是否已摧毁
          this._originalSprite = null;
          // 原始精灵图
          this._destroyAnimationSpeed = 0.95;
        }

        // 摧毁动画速度衰减系数
        onLoad() {
          this._rigidBody = null;
          this._direction = 0;
          this._accel = 0;
          this._angle = 0;
          this._targetAngle = 0;
          this._lastValidPosition = new Vec2(); // 初始化摧毁状态

          this._isDestroyed = false;
        }

        start() {
          this._rigidBody = this.getComponent(RigidBody2D);

          if (!this._rigidBody || !this.node || !this.node.isValid) {
            console.error('AIPlayer requires RigidBody2D component and valid node');
            return;
          }

          this._rigidBody.type = ERigidBody2DType.Dynamic;
          this._rigidBody.allowSleep = false;
          this._rigidBody.gravityScale = 0;
          this._rigidBody.linearDamping = 0.3;
          this._rigidBody.angularDamping = 0.9;
          this._rigidBody.fixedRotation = true;
          this._lastValidPosition = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y);
          this._angle = this.initAngle;
          this._targetAngle = this.initAngle;
          this.node.setRotationFromEuler(0, 0, this.initAngle); // 初始化血条

          this.initHealthBar(); // 保存原始精灵图

          var sprite = this.getComponent(Sprite);

          if (sprite && sprite.spriteFrame) {
            this._originalSprite = sprite.spriteFrame;
          } // 检查BoxCollider2D组件是否存在


          var collider = this.getComponent(BoxCollider2D);

          if (collider) {
            console.log('AIPlayer BoxCollider2D component found');
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
          } else {
            console.error('AIPlayer BoxCollider2D component not found');
          }
        }
        /**
         * 初始化血条
         */


        initHealthBar() {
          this._currentHealth = this.maxHealth; // 如果没有手动设置血条UI，尝试自动查找
          // if (!this.healthBarUI) {
          //     this.healthBarUI = this.node.getComponentInChildren(HealthBarUI);
          // }
          // if (this.healthBarUI) {
          //     // 设置血条的目标为当前AI车辆
          //     this.healthBarUI.setTarget(this.node);
          //     this.updateHealthBar();
          // } else {
          //     console.warn('AIPlayer: 未找到HealthBarUI组件');
          // }
        }
        /**
         * 更新血条显示
         */


        updateHealthBar() {
          if (this.healthBar) {
            this.healthBar.progress = this._currentHealth / this.maxHealth;
            console.log('AIPlayer updating health bar:', this._currentHealth / this.maxHealth);
          }
        }

        update(deltaTime) {
          if (!this._rigidBody || !this.node || !this.node.isValid) return; // 如果车辆已摧毁，执行摧毁动画逻辑

          if (this._isDestroyed) {
            return;
          }

          var currentVelocity = this._rigidBody.linearVelocity;
          var currentSpeed = currentVelocity.length();
          var currentPos = new Vec2(this.node.worldPosition.x, this.node.worldPosition.y); // 更新目标角度（转向）

          if (this._direction !== 0) {
            var turnAmount = this.turnSpeed * deltaTime * this._direction;
            this._targetAngle -= turnAmount;
          } // 平滑角度插值，防止突然转向


          var angleDiff = this._targetAngle - this._angle;

          if (Math.abs(angleDiff) > 0.1) {
            this._angle += angleDiff * 0.1; // 平滑插值
          } else {
            this._angle = this._targetAngle;
          } // 设置节点旋转


          this.node.setRotationFromEuler(0, 0, this._angle); // 前进

          if (this._accel === 1) {
            // 正常加速
            var rad = (this._angle + 90) * Math.PI / 180;
            var force = new Vec2(Math.cos(rad) * this.acceleration, Math.sin(rad) * this.acceleration);

            this._rigidBody.applyForce(force, currentPos, true);
          } // 刹车
          else if (this._accel === -1) {
            // 如果当前速度方向与车辆朝向一致，施加反向力（刹车）
            var _rad = (this._angle + 90) * Math.PI / 180;

            var forward = new Vec2(Math.cos(_rad), Math.sin(_rad));
            var dot = currentVelocity.dot(forward);

            if (dot > 0) {
              // 施加强力反向力（刹车）
              var brakeForce = forward.clone().multiplyScalar(-this.brakeDeceleration);

              this._rigidBody.applyForce(brakeForce, currentPos, true);
            } else {
              // 允许倒车
              var reverseForce = forward.clone().multiplyScalar(-this.acceleration * 0.5);

              this._rigidBody.applyForce(reverseForce, currentPos, true);
            }
          } // 松开加速/刹车键
          else {
            // 增大摩擦力，让车辆更快停下来
            if (currentSpeed > 1) {
              var frictionForce = currentVelocity.clone().multiplyScalar(-this.friction * 2); // 2倍摩擦

              this._rigidBody.applyForce(frictionForce, currentPos, true);
            }
          } // 限制最大速度


          if (currentSpeed > this.maxSpeed) {
            var normalizedVelocity = currentVelocity.clone().normalize();
            this._rigidBody.linearVelocity = normalizedVelocity.multiplyScalar(this.maxSpeed);
          } // 防止车辆卡住或异常位置


          if (currentSpeed < 0.1) {
            // 如果速度很小，重置到上次有效位置附近
            var distanceToLastPos = Vec2.distance(currentPos, this._lastValidPosition);

            if (distanceToLastPos > 50) {
              // 如果偏离太远
              this.node.setWorldPosition(this._lastValidPosition.x, this._lastValidPosition.y, this.node.worldPosition.z);
              this._rigidBody.linearVelocity = Vec2.ZERO;
            }
          } else {
            // 更新有效位置
            this._lastValidPosition = currentPos.clone();
          } // 防止车辆旋转过度


          if (Math.abs(this._angle) > 360) {
            this._angle = this._angle % 360;
            this._targetAngle = this._targetAngle % 360;
          }
        } // 供AI控制器调用的接口


        setAccel(accel) {
          this._accel = accel;
        }

        setDirection(direction) {
          this._direction = direction;
        }

        setTargetAngle(angle) {
          this._targetAngle = angle;
        }

        getCurrentAngle() {
          return this._angle;
        }

        init(angle) {
          this.initAngle = angle;
          this._angle = angle;
          this._targetAngle = angle;
          this.node.setRotationFromEuler(0, 0, angle);
        } // 血量管理接口

        /**
         * 设置当前生命值
         */


        setHealth(health) {
          this._currentHealth = Math.max(0, Math.min(health, this.maxHealth));
          this.updateHealthBar();
        }
        /**
         * 减少生命值
         */


        takeDamage(damage) {
          if (this._isDestroyed) return;
          console.log('AIPlayer taking damage:', damage);
          this.setHealth(this._currentHealth - damage);
          this.updateHealthBar(); // 检查是否死亡

          if (this._currentHealth <= 0) {
            this.destroyVehicle();
          }
        }
        /**
         * 恢复生命值
         */


        heal(amount) {
          this.setHealth(this._currentHealth + amount);
          this.updateHealthBar();
        }
        /**
         * 获取当前生命值
         */


        getHealth() {
          return this._currentHealth;
        }
        /**
         * 获取最大生命值
         */


        getMaxHealth() {
          return this.maxHealth;
        }
        /**
         * 检查是否死亡
         */


        isDead() {
          return this._currentHealth <= 0;
        }
        /**
         * 碰撞事件处理
         */


        onCollisionEnter(other, self) {
          console.log('AIPlayer collided with something');
          var playerComponent = other.node.getComponent(_crd && player === void 0 ? (_reportPossibleCrUseOfplayer({
            error: Error()
          }), player) : player);

          if (playerComponent) {
            console.log('AIPlayer 被玩家车辆撞击');
            var playerRigidBody = playerComponent.getRigidBody();

            if (playerRigidBody) {
              var impactForce = new Vec2(playerRigidBody.linearVelocity.x, playerRigidBody.linearVelocity.y);
              impactForce.normalize(); // 归一化方向

              impactForce.multiplyScalar(100); // 增加冲力强度

              this._rigidBody.linearVelocity = impactForce;
            }
          }
        } // ==================== 摧毁系统 ====================

        /**
         * 摧毁车辆
         */


        destroyVehicle() {
          if (this._isDestroyed) return;
          this._isDestroyed = true;
          console.log('AI车辆被摧毁！');
          (_crd && SoundManager === void 0 ? (_reportPossibleCrUseOfSoundManager({
            error: Error()
          }), SoundManager) : SoundManager).instance.playSoundEffect('carDestruction'); // 切换到摧毁状态的精灵图

          if (this.destroyedSprite) {
            var sprite = this.getComponent(Sprite);

            if (sprite) {
              sprite.spriteFrame = this.destroyedSprite;
            }
          } // 隐藏血条


          if (this.healthBar && this.healthBar.node) {
            this.healthBar.node.active = false;
          } // 开始摧毁动画


          this.startDestroyAnimation(); // 立即更新敌人数量（不等待节点移除）

          this.updateEnemyCount(); // 延迟移除节点

          this.scheduleRemoveNode();
        }
        /**
         * 更新敌人数量
         */


        updateEnemyCount() {
          var gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
            error: Error()
          }), GameManager) : GameManager).getInstance();

          if (gameManager) {
            // 计算当前存活的AI数量
            var allAIPlayers = gameManager.getAIPlayers();
            var aliveCount = allAIPlayers.filter(ai => !ai.isDestroyed()).length;
            gameManager.refreshEnemyCount(aliveCount);
          }
        }
        /**
         * 安排移除节点
         */


        scheduleRemoveNode() {
          if (this.node && this.node.isValid) {
            // 使用scheduleOnce在指定时间后执行移除
            this.scheduleOnce(() => {
              this.removeVehicleNode();
            }, this.removeDelay);
          }
        }
        /**
         * 移除车辆节点
         */


        removeVehicleNode() {
          if (this.node && this.node.isValid) {
            console.log('移除AI车辆节点'); // 从GameManager的AI列表中移除

            var gameManager = (_crd && GameManager === void 0 ? (_reportPossibleCrUseOfGameManager({
              error: Error()
            }), GameManager) : GameManager).getInstance();

            if (gameManager) {
              var aiPlayers = gameManager.getAIPlayers();
              var index = aiPlayers.indexOf(this);

              if (index !== -1) {
                aiPlayers.splice(index, 1);
              } // 再次更新敌人数量（基于实际存在的AI数量）


              gameManager.refreshEnemyCount(aiPlayers.length);
            } // 移除节点


            this.node.removeFromParent();
          }
        }
        /**
         * 开始摧毁动画
         */


        startDestroyAnimation() {
          if (this.node) {
            // 添加摧毁动画效果
            tween(this.node).to(2.0, {
              scale: new Vec3(1.1, 1.1, 1) // 稍微缩小
              // angle: this.node.angle + 180 // 旋转180度

            }).start();
          }
        }
        /**
         * 更新摧毁动画
         */

        /**
         * 是否已摧毁
         */


        isDestroyed() {
          return this._isDestroyed;
        }
        /**
         * 恢复车辆（用于重新开始游戏）
         */
        // public restoreVehicle() {
        //     // 取消移除节点的计划
        //     this.unschedule(this.removeVehicleNode);
        //     this._isDestroyed = false;
        //     this._currentHealth = this.maxHealth;
        //     // 恢复原始精灵图
        //     if (this._originalSprite) {
        //         const sprite = this.getComponent(Sprite);
        //         if (sprite) {
        //             sprite.spriteFrame = this._originalSprite;
        //         }
        //     }
        //     // 显示血条
        //     if (this.healthBar && this.healthBar.node) {
        //         this.healthBar.node.active = true;
        //     }
        //     // 更新血条
        //     this.updateHealthBar();
        //     // 恢复节点状态
        //     if (this.node) {
        //         this.node.setScale(1, 1);
        //         this.node.angle = this.initAngle;
        //     }
        //     // 重置速度
        //     if (this._rigidBody) {
        //         this._rigidBody.linearVelocity = Vec2.ZERO;
        //     }
        //     console.log('AI车辆已恢复');
        // }


      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "maxSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 50;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "acceleration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 50;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "brakeDeceleration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 200;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "turnSpeed", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 50;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "friction", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 1.5;
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "initAngle", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 0;
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "maxHealth", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 30;
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "healthBar", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "destroyedSprite", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "removeDelay", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 3.0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9b583689b76a894a84c2dd298f4c18778bad0e35.js.map