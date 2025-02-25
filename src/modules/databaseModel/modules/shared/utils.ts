import { ETsType } from "@/types";

import { format } from "@/core";
import { mapEnumNameWithoutPrefix } from "@/utils/common";

export type TColumnDetail = {
    tsType: string;
    nullable: boolean;
    enumType: string;
};

export function mapAssertionMethod({
    tsType,
    nullable,
    enumType,
}: TColumnDetail) {
    switch (tsType) {
        case ETsType.Number: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertSafeInteger(val)`;
            } else {
                return `(val) => CommonUtils.assertSafeInteger(val)`;
            }
        }
        case ETsType.NumberArr: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val) => CommonUtils.assertSafeInteger(val))`;
            } else {
                return `(val) => CommonUtils.assertArray(val)`;
            }
        }
        case ETsType.String: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableString(val)`;
            } else {
                return `(val) => CommonUtils.assertString(val)`;
            }
        }
        case ETsType.StringArr: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => CommonUtils.assertString(val))`;
            } else {
                return `(val) => CommonUtils.assertArray(val).map((val: unknown) => CommonUtils.assertString(val))`;
            }
        }
        case ETsType.Boolean: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableBoolean(val)`;
            } else {
                return `(val) => CommonUtils.assertBoolean(val)`;
            }
        }
        case ETsType.Date: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableDate(val)`;
            } else {
                return `(val) => CommonUtils.assertDate(val)`;
            }
        }
        case ETsType.Buffer: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertBuffer(val)`;
            } else {
                return `(val) => CommonUtils.assertBuffer(val)`;
            }
        }
        default: {
            if (tsType.endsWith("[]")) {
                if (nullable) {
                    return format(
                        `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => assertOptional%s(CommonUtils.assertNullableString(val)))`,
                        mapEnumNameWithoutPrefix(enumType.replace("[]", ""))
                    );
                } else {
                    return format(
                        `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => assert%s(CommonUtils.assertString(val)))`,
                        mapEnumNameWithoutPrefix(enumType.replace("[]", ""))
                    );
                }
            } else {
                if (nullable) {
                    return format(
                        `(val) => assertOptional%s(CommonUtils.assertNullableString(val))`,
                        mapEnumNameWithoutPrefix(enumType)
                    );
                } else {
                    return format(
                        `(val) => assert%s(CommonUtils.assertString(val))`,
                        mapEnumNameWithoutPrefix(enumType)
                    );
                }
            }
        }
    }
}
