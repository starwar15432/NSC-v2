require('global');

module.exports = function () {
    StructureSpawn.prototype.createCustomCreep =
        function (room, energy, roleName, amountToSave) {

            var numberOfParts;
            var body = [];

            var spawn = this;

            var creepName = function (roleName) {
                var name = roleName + '-' + Game.time % 100000 + '-' + spawn.pos.x + spawn.pos.y;
                return name;
            };

            var sortedParts = function (body) {
                if (body == undefined) return undefined;
                return _(body).sortBy(function (part) {
                        if (part === TOUGH)
                            return 0;
                        else if (part === HEAL)
                            return BODYPARTS_ALL.length;
                        else
                            return _.random(1, BODYPARTS_ALL.length - 1);
                    })
                    .value();
            };

            switch (roleName) {
                case 'harvester':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 200) / 100);
                    if (numberOfParts > 4) {
                        if (numberOfParts > 0) {
                            if (numberOfParts > 6) {
                                numberOfParts = 6;
                            }
                            body.push(MOVE);
                            body.push(MOVE);
                            body.push(MOVE);
                            body.push(CARRY);
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(WORK);
                            }
                        }
                    }
                    else {
                        body.push(MOVE);
                        body.push(CARRY);
                        body.push(WORK);
                        body.push(WORK);
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'distributor':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 150);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'storageDistributor':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 150);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 8) numberOfParts = 8;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'carrier':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 150);
                    if (numberOfParts > 0) {

                        if (global[room.name].containers.length == 1) if (numberOfParts > 2) numberOfParts = 2;
                        else if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'warrior':
                    var numberOfRanged = _.sum(Game.creeps, (c) => c.memory.role == 'warrior' && c.memory.room == room.name && c.getActiveBodyparts(RANGED_ATTACK) >= 1);
                    var numberOfAttack = _.sum(Game.creeps, (c) => c.memory.role == 'warrior' && c.memory.room == room.name && c.getActiveBodyparts(ATTACK) >= 1);


                    if (numberOfRanged <= 3) {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 200);
                        if (numberOfParts > 0) {
                            if (numberOfParts > 25) numberOfParts = 25;

                            if (numberOfParts > 5) {
                                numberOfParts = 5;
                            }
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(MOVE);
                                body.push(RANGED_ATTACK);
                            }
                        }
                    }
                    else if (numberOfAttack < 10) {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 210);
                        if (numberOfParts > 0) {
                            if (numberOfParts > 16) numberOfParts = 16;

                            if (numberOfParts > 5) {
                                numberOfParts = 5;
                            }
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(MOVE);
                                body.push(ATTACK);
                                body.push(ATTACK);
                            }
                        }
                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 300);
                        if (numberOfParts > 0) {
                            if (numberOfParts > 25) numberOfParts = 25;

                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(MOVE);
                                body.push(HEAL);
                            }
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'upgrader':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 150) / 250);
                    if (numberOfParts > 1) {
                        if (room.controller.level <= 7) {
                            if (numberOfParts > 15) numberOfParts = 15;
                        }
                        else {
                            var maxPart = Math.floor((room.storage.store.energy - 5000) / 10000);
                            if (numberOfParts > maxPart) numberOfParts = maxPart > 7 ? 7 : maxPart;
                            if (numberOfParts < 1) {
                                if (room.controller.ticksToDowngrade < 10000) return 'remove';
                                numberOfParts = 1;
                            }
                        }

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(MOVE);
                            body.push(WORK);
                            body.push(WORK);
                        }
                        body.push(MOVE);
                        body.push(CARRY);
                        body.push(CARRY);
                    }
                    else {
                        numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 50) / 150);
                        if (numberOfParts > 0) {
                            if (room.controller.level < 7) {
                                if (numberOfParts > 24) numberOfParts = 24;
                            }
                            else if (numberOfParts > 12) numberOfParts = 12;

                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(MOVE);
                                body.push(WORK);
                            }
                            body.push(CARRY);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'caretaker':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 200);
                    if (numberOfParts > 0) {
                        if (_.sum(room.find(FIND_MY_CONSTRUCTION_SITES), 'progressTotal') - _.sum(room.find(FIND_MY_CONSTRUCTION_SITES), 'progress') < 10000) {
                            if (numberOfParts > 7) numberOfParts = 7;
                        }
                        else if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'landlord':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 650);
                    if (room.energyCapacityAvailable >= 650 * 3) {
                        if (numberOfParts > 1) {
                            if (numberOfParts > 6) numberOfParts = 6;

                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(CLAIM);
                                body.push(MOVE);
                            }
                        }
                    }
                    else if (numberOfParts > 0) {
                        body.push(CLAIM);
                        body.push(MOVE);
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'remoteHarvester':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 100) / 150);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 7) {
                            numberOfParts = 7;
                        }
                        body.push(MOVE);
                        _.times(numberOfParts, () => body.push(MOVE));
                        body.push(CARRY);
                        _.times(numberOfParts, () => body.push(WORK));
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'remoteMiner':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 100) / 150);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 24) {
                            numberOfParts = 24;
                        }

                        body.push(MOVE);
                        _.times(numberOfParts, () => body.push(MOVE));
                        body.push(CARRY);
                        _.times(numberOfParts, () => body.push(WORK));
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'remoteHauler':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 150) / 150);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        body.push(WORK);
                        body.push(MOVE);
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(MOVE);
                            body.push(CARRY);
                            body.push(CARRY);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        goingHome: false
                    });
                case 'remoteGuard':
                    if (room.controller.level < 8 || CONTROLLER_STRUCTURES.extension[8] > global[room.name].extensions && Memory.rooms[room].spawnQueue.normal.length > 5) return 'remove';
                    if (room.energyAvailable < room.energyCapacityAvailable) return;

                        _.times(25, () => body.push(MOVE));
                        _.times(20, () => body.push(ATTACK));
                        _.times(5, () => body.push(HEAL));

                    return this.createCreep(body, creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'otherRoomCreep':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 200);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(WORK);
                            body.push(MOVE);
                            body.push(CARRY);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'energyThief':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 100);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 25) numberOfParts = 25;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'energyHelper':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 100);
                    if (numberOfParts > 0) {
                        if (numberOfParts > 25) numberOfParts = 25;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(MOVE);
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'miner':
                    numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 50) / 350);

                    if (numberOfParts > 1) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        body.push(CARRY);
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(MOVE);
                            body.push(WORK);
                            body.push(WORK);
                        }
                    }
                    else {
                        numberOfParts = Math.floor(((energy - (energy * amountToSave)) - 50) / 250);
                        if (numberOfParts > 0) {
                            if (numberOfParts > 24) numberOfParts = 24;

                            body.push(CARRY);
                            for (let i = 0; i < numberOfParts; i++) {
                                body.push(MOVE);
                                body.push(WORK);
                            }
                        }
                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {
                        role: roleName,
                        room: room.name,
                        w: false
                    });
                case 'guard':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 590);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 5) numberOfParts = 5;

                        _.times(numberOfParts, () => body.push(RANGED_ATTACK));
                        _.times(numberOfParts, () => body.push(ATTACK));
                        _.times(numberOfParts, () => body.push(HEAL));
                        _.times(numberOfParts, () => body.push(TOUGH));
                        _.times(numberOfParts * 4, () => body.push(MOVE));

                    }
                    else if (room.energyCapacityAvailable < 2000) {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'creepHarasser':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 340);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 10) numberOfParts = 10;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(TOUGH);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'spawnSmasher':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 340);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 10) numberOfParts = 10;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(TOUGH);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'structureDestroyer':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 340);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 10) numberOfParts = 10;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(TOUGH);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'wallBreaker':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 340);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 10) numberOfParts = 10;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(TOUGH);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(RANGED_ATTACK);
                            body.push(ATTACK);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'warHealer':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 360);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(TOUGH);
                            body.push(HEAL);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 25) numberOfParts = 25;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(HEAL);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                case 'towerDrainer':
                    numberOfParts = Math.floor((energy - (energy * amountToSave)) / 360);
                    if (numberOfParts > 1) {
                        if (numberOfParts > 16) numberOfParts = 16;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(TOUGH);
                            body.push(HEAL);
                            body.push(MOVE);
                            body.push(MOVE);
                        }

                    }
                    else {
                        numberOfParts = Math.floor((energy - (energy * amountToSave)) / 280);
                        if (numberOfParts > 25) numberOfParts = 25;

                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(HEAL);
                            body.push(MOVE);
                        }

                    }
                    return this.createCreep(sortedParts(body), creepName(roleName), {role: roleName, room: room.name, w: false});
                default:
                    if (roleName !== undefined) global.errorLog('Try to create creep ' + roleName + 'failed', room);
                    return undefined;
            }
            
        };
};