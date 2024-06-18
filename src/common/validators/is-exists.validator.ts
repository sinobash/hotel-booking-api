import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DataSource } from 'typeorm';

type ValidationEntity =
    | {
          id?: number | string;
      }
    | undefined;

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
    ) {}

    async validate(value: string, validationArguments: ValidationArguments) {
        const repository = validationArguments.constraints[0];
        const pathToProperty = validationArguments.constraints[1];
        const entity: unknown = await this.dataSource.getRepository(repository).findOne({
            where: {
                [pathToProperty || validationArguments.property]: pathToProperty ? value?.[pathToProperty] : value,
            },
        });

        return Boolean(entity);
    }
}
