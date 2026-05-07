/**
 * VersionUtilities Jest Test Suite
 * JavaScript port of the Java JUnit tests
 */

const { VersionUtilities, VersionPrecision, FHIRException } = require('../../library/version-utilities');

describe('VersionUtilities', () => {

    describe('isSemVer', () => {
        test('should validate basic semver versions', () => {
            test_isSemVer("0.1.1", true);
            test_isSemVer("0.1.1-ballot1", true);
            test_isSemVer("0.0.0-alpha.0.131", true);
            test_isSemVer("0.1.a", false);
        });

        test('should handle valid semver formats', () => {
            test_isSemVer("1.0.0", true);
            test_isSemVer("2.1.3", true);
            test_isSemVer("10.20.30", true);
            test_isSemVer("0.0.1", true);
        });

        test('should handle valid semver with prerelease', () => {
            test_isSemVer("1.0.0-alpha", true);
            test_isSemVer("2.1.0-beta.1", true);
            test_isSemVer("3.2.5-rc.2", true);
            test_isSemVer("1.0.0-alpha.beta", true);
            test_isSemVer("1.0.0-alpha.1", true);
        });

        test('should handle two-part versions', () => {
            test_isSemVer("1.0", true);
            test_isSemVer("2.5", true);
            test_isSemVer("10.15", true);
        });

        test('should reject single-part versions', () => {
            test_isSemVer("1", false);
            test_isSemVer("5", false);
            test_isSemVer("10", false);
        });

        test('should reject FHIR special versions', () => {
            test_isSemVer("r2", false);
            test_isSemVer("r3", false);
            test_isSemVer("r4", false);
            test_isSemVer("r4B", false);
            test_isSemVer("r5", false);
            test_isSemVer("r6", false);
            test_isSemVer("R2", false);
            test_isSemVer("R3", false);
            test_isSemVer("R4", false);
            test_isSemVer("R4B", false);
            test_isSemVer("R5", false);
            test_isSemVer("R6", false);
        });

        test('should reject invalid versions', () => {
            test_isSemVer("", false);
            test_isSemVer(null, false);
            test_isSemVer("1.0.0.0", false);
            test_isSemVer("1.0.", false);
            test_isSemVer("1..0", false);
            test_isSemVer("a.b.c", false);
            test_isSemVer("1.0.0-", false);
            test_isSemVer("r7", false);
            test_isSemVer("r", false);
        });

        test('should handle complex labels', () => {
            test_isSemVer("1.0.0-alpha+build", true);
            test_isSemVer("1.0.0-alpha-beta+build-123", true);
            test_isSemVer("1.0.0-alpha.1+build.2", true);
            test_isSemVer("1.0.0-0.1.2+build.3.4", true);
            test_isSemVer("1.0.0+build-only", true);
            test_isSemVer("1.0.0-prerelease-only", true);
        });

        test('should reject leading zeros', () => {
            test_isSemVer("01.0.0", false);
            test_isSemVer("1.01.0", false);
            test_isSemVer("1.0.01", false);
            test_isSemVer("001.002.003", false);
            test_isSemVer("0.0.0", true); // Zero itself is fine
            test_isSemVer("1.0.0", true);
        });
    });

    describe('isThisOrLater', () => {
        test('should handle simple comparisons', () => {
            test_isThisOrLaterMajorMinor("0.1", "0.2", true);
            test_isThisOrLaterMajorMinor("0.2", "0.1", false);
        });

        test('should use numeric comparison', () => {
            test_isThisOrLaterMajorMinor("0.9", "0.10", true);
            test_isThisOrLaterMajorMinor("0.10", "0.9", false);
        });

        test('should handle different lengths', () => {
            test_isThisOrLaterMajorMinor("0.9", "0.9.1", true);
            test_isThisOrLaterMajorMinor("0.9.1", "0.9", true);
            test_isThisOrLater("0.9", "0.9.1", true);
            test_isThisOrLater("0.9.1", "0.9", false);
        });

        test('should handle same versions', () => {
            test_isThisOrLaterMajorMinor("1.0.0", "1.0.0", true);
            test_isThisOrLaterMajorMinor("2.1.3", "2.1.3", true);
            test_isThisOrLaterMajorMinor("r4", "r4", true);
            test_isThisOrLaterMajorMinor("R5", "r5", true);
        });

        test('should handle later versions', () => {
            test_isThisOrLaterMajorMinor("1.0.0", "1.0.1", true);
            test_isThisOrLaterMajorMinor("1.0.0", "1.1.0", true);
            test_isThisOrLaterMajorMinor("1.0.0", "2.0.0", true);
            test_isThisOrLaterMajorMinor("2.1.0", "2.1.5", true);
            test_isThisOrLaterMajorMinor("r3", "r4", true);
            test_isThisOrLaterMajorMinor("r4", "r5", true);
        });
    });

    describe('getMajMin', () => {
        test('should extract major.minor from standard semver', () => {
            test_getMajMin("1.0.0", "1.0");
            test_getMajMin("2.1.3", "2.1");
            test_getMajMin("10.5.2", "10.5");
            test_getMajMin("0.9.1", "0.9");
        });

        test('should extract major.minor with prerelease', () => {
            test_getMajMin("1.0.0-alpha", "1.0");
            test_getMajMin("2.1.0-beta.1", "2.1");
            test_getMajMin("3.2.5-rc.2", "3.2");
        });

        test('should handle two-part versions', () => {
            test_getMajMin("1.0", "1.0");
            test_getMajMin("2.5", "2.5");
        });

        test('should return null for single-part versions', () => {
            test_getMajMin("1", null);
            test_getMajMin("5", null);
        });

        test('should handle FHIR special versions', () => {
            test_getMajMin("r2", "1.0");
            test_getMajMin("r3", "3.0");
            test_getMajMin("r4", "4.0");
            test_getMajMin("r4B", "4.3");
            test_getMajMin("r5", "5.0");
            test_getMajMin("r6", "6.0");
            test_getMajMin("R2", "1.0");
            test_getMajMin("R3", "3.0");
            test_getMajMin("R4", "4.0");
            test_getMajMin("R4B", "4.3");
            test_getMajMin("R5", "5.0");
            test_getMajMin("R6", "6.0");
        });
    });

    describe('getMajMinPatch', () => {
        test('should extract major.minor.patch from standard semver', () => {
            test_getMajMinPatch("1.0.0", "1.0.0");
            test_getMajMinPatch("2.1.3", "2.1.3");
            test_getMajMinPatch("10.5.2", "10.5.2");
        });

        test('should extract major.minor.patch with prerelease', () => {
            test_getMajMinPatch("1.0.0-alpha", "1.0.0");
            test_getMajMinPatch("2.1.0-beta.1", "2.1.0");
            test_getMajMinPatch("3.2.5-rc.2", "3.2.5");
        });

        test('should default patch to 0 for two-part versions', () => {
            test_getMajMinPatch("1.0", "1.0.0");
            test_getMajMinPatch("2.5", "2.5.0");
        });

        test('should return null for single-part versions', () => {
            test_getMajMinPatch("1", null);
            test_getMajMinPatch("5", null);
        });

        test('should handle FHIR special versions', () => {
            test_getMajMinPatch("r2", "1.0.2");
            test_getMajMinPatch("r3", "3.0.2");
            test_getMajMinPatch("r4", "4.0.1");
            test_getMajMinPatch("r4B", "4.3.0");
            test_getMajMinPatch("r5", "5.0.0");
            test_getMajMinPatch("r6", "6.0.0");
        });
    });

    describe('getPatch', () => {
        test('should extract patch from standard semver', () => {
            test_getPatch("1.0.0", "0");
            test_getPatch("2.1.3", "3");
            test_getPatch("1.2.15", "15");
        });

        test('should extract patch with prerelease', () => {
            test_getPatch("1.0.0-alpha", "0");
            test_getPatch("2.1.5-beta.1", "5");
            test_getPatch("3.2.10-rc.2", "10");
        });

        test('should default patch to 0 for two-part versions', () => {
            test_getPatch("1.0", "0");
            test_getPatch("2.5", "0");
        });

        test('should throw for single-part versions', () => {
            expect(() => VersionUtilities.getPatch("1")).toThrow(FHIRException);
            expect(() => VersionUtilities.getPatch("5")).toThrow(FHIRException);
        });

        test('should handle FHIR special versions', () => {
            test_getPatch("r2", "2");
            test_getPatch("r3", "2");
            test_getPatch("r4", "1");
            test_getPatch("r4B", "0");
            test_getPatch("r5", "0");
            test_getPatch("r6", "0");
        });
    });

    describe('version increment methods', () => {
        test('incMajorVersion should increment major and reset minor/patch', () => {
            test_incMajorVersion("1.0.0", "2.0.0");
            test_incMajorVersion("2.5.10", "3.0.0");
            test_incMajorVersion("10.20.30", "11.0.0");
            test_incMajorVersion("0.9.5", "1.0.0");
            test_incMajorVersion("1.0.0-alpha", "2.0.0");
            test_incMajorVersion("2.1.0-beta.1", "3.0.0");
            test_incMajorVersion("1.5", "2.0.0");
            test_incMajorVersion("3.0", "4.0.0");
        });

        test('incMinorVersion should increment minor and reset patch', () => {
            test_incMinorVersion("1.0.0", "1.1.0");
            test_incMinorVersion("2.5.10", "2.6.0");
            test_incMinorVersion("10.20.30", "10.21.0");
            test_incMinorVersion("1.0.0-alpha", "1.1.0");
            test_incMinorVersion("2.1.0-beta.1", "2.2.0");
            test_incMinorVersion("1.5", "1.6.0");
            test_incMinorVersion("3.0", "3.1.0");
        });

        test('incPatchVersion should increment patch', () => {
            test_incPatchVersion("1.0.0", "1.0.1");
            test_incPatchVersion("2.5.10", "2.5.11");
            test_incPatchVersion("10.20.30", "10.20.31");
            test_incPatchVersion("1.0.0-alpha", "1.0.1");
            test_incPatchVersion("2.1.0-beta.1", "2.1.1");
            test_incPatchVersion("1.5", "1.5.1");
            test_incPatchVersion("3.0", "3.0.1");
        });
    });

    describe('versionMatches', () => {
        test('should handle exact matches', () => {
            test_versionMatches("2.0", "2.0", true);
            test_versionMatches("2.0.0", "2.0.0", true);
            test_versionMatches("1.5.3", "1.5.3", true);
            test_versionMatches("r4", "r4", true);
            test_versionMatches("R5", "r5", true);

            test_versionMatches("2.0", "2.0.0", false);
            test_versionMatches("2.0", "2.0.1", false);
            test_versionMatches("2.0.0", "2.0.1", false);
            test_versionMatches("2.0.0", "2.0.0-something", false);
            test_versionMatches("2.0.0", "2.0.0+something", false);
        });

        test('should handle star wildcards', () => {
            test_versionMatches("2.*", "2.0", true);
            test_versionMatches("2.*", "2.1", true);
            test_versionMatches("2.*", "2.99", true);
            test_versionMatches("2.*", "2.0.0", false);
            test_versionMatches("2.*", "2.1-something", false);
            test_versionMatches("2.*", "3.0", false);

            test_versionMatches("2.0.*", "2.0.0", true);
            test_versionMatches("2.0.*", "2.0.1", true);
            test_versionMatches("2.0.*", "2.0.99", true);
            test_versionMatches("2.0.*", "2.0.0-something", false);
            test_versionMatches("2.0.*", "2.0.0+something", false);
            test_versionMatches("2.0.*", "2.1.0", false);

            test_versionMatches("2.0.0-*", "2.0.0-prerelease", true);
            test_versionMatches("2.0.0-*", "2.0.0-alpha", true);
            test_versionMatches("2.0.0-*", "2.0.0-beta.1", true);
            test_versionMatches("2.0.0-*", "2.0.0+build", false);
            test_versionMatches("2.0.0-*", "2.0.0", false);

            test_versionMatches("2.0.0+*", "2.0.0+build", true);
            test_versionMatches("2.0.0+*", "2.0.0+anything", true);
            test_versionMatches("2.0.0+*", "2.0.0+build.123", true);
            test_versionMatches("2.0.0+*", "2.0.0", false);
            test_versionMatches("2.0.0+*", "2.0.0-prerelease", false);
        });

        test('should handle x/X wildcards', () => {
            test_versionMatches("2.x", "2.0", true);
            test_versionMatches("2.x", "2.1", true);
            test_versionMatches("2.x", "2.0.0", false);
            test_versionMatches("2.X", "2.0", true);
            test_versionMatches("2.X", "2.1", true);
            test_versionMatches("2.X", "2.0.0", false);
            test_versionMatches("2.0.x", "2.0.0", true);
            test_versionMatches("2.0.X", "2.0.1", true);

            test_versionMatches("2.0.0-x", "2.0.0-x", true);
            test_versionMatches("2.0.0-x", "2.0.0-y", false);
            test_versionMatches("2.0.0+X", "2.0.0+X", true);
            test_versionMatches("2.0.0+X", "2.0.0+Y", false);
        });

        test('should handle question mark prefix matching', () => {
            test_versionMatches("2.0?", "2.0", true);
            test_versionMatches("2.0?", "2.0.1", true);
            test_versionMatches("2.0?", "2.0.0-build", true);
            test_versionMatches("2.0?", "2.0.1+build", true);
            test_versionMatches("2.0?", "2.1", false);

            test_versionMatches("2.0.1?", "2.0.1", true);
            test_versionMatches("2.0.1?", "2.0.1-release", true);
            test_versionMatches("2.0.1?", "2.0.1+build", true);
            test_versionMatches("2.0.1?", "2.0.2", false);
        });

        test('should handle error conditions', () => {
            expect(() => VersionUtilities.versionMatches(null, "1.0.0")).toThrow(FHIRException);
            expect(() => VersionUtilities.versionMatches("1.0.0", null)).toThrow(FHIRException);
            expect(() => VersionUtilities.versionMatches("", "1.0.0")).toThrow(FHIRException);
            expect(() => VersionUtilities.versionMatches("1.0.0", "")).toThrow(FHIRException);
        });
    });

    describe('FHIR version checks', () => {
        test('isR5Plus should identify R5+ versions', () => {
            test_isR5Plus("r5", true);
            test_isR5Plus("R5", true);
            test_isR5Plus("r6", true);
            test_isR5Plus("5.0.0", true);
            test_isR5Plus("6.0.0", true);
            test_isR5Plus("4.5.0", true);
            test_isR5Plus("r4", false);
            test_isR5Plus("r4B", false);
            test_isR5Plus("4.0.0", false);
            test_isR5Plus("4.4.0", false);
        });

        test('isR4Plus should identify R4+ versions', () => {
            test_isR4Plus("r4", true);
            test_isR4Plus("R4", true);
            test_isR4Plus("r4B", true);
            test_isR4Plus("r5", true);
            test_isR4Plus("r6", true);
            test_isR4Plus("4.0.0", true);
            test_isR4Plus("4.1.0", true);
            test_isR4Plus("5.0.0", true);
            test_isR4Plus("3.2.0", true);
            test_isR4Plus("r3", false);
            test_isR4Plus("3.0.0", false);
            test_isR4Plus("3.1.0", false);
        });

        test('isR6Plus should identify R6+ versions', () => {
            test_isR6Plus("r6", true);
            test_isR6Plus("R6", true);
            test_isR6Plus("6.0.0", true);
            test_isR6Plus("r5", false);
            test_isR6Plus("r4", false);
            test_isR6Plus("5.0.0", false);
            test_isR6Plus("4.0.0", false);
        });
    });

    describe('removeVersionFromCanonical', () => {
        test('should remove version from canonical URLs', () => {
            test_removeVersionFromCanonical("http://example.com/CodeSystem|1.0.0", "http://example.com/CodeSystem");
            test_removeVersionFromCanonical("http://hl7.org/fhir/CodeSystem/test|2.1.5", "http://hl7.org/fhir/CodeSystem/test");
            test_removeVersionFromCanonical("http://test.org/cs|r4", "http://test.org/cs");
        });

        test('should handle URLs without versions', () => {
            test_removeVersionFromCanonical("http://example.com/CodeSystem", "http://example.com/CodeSystem");
            test_removeVersionFromCanonical("http://hl7.org/fhir/CodeSystem/test", "http://hl7.org/fhir/CodeSystem/test");
        });

        test('should handle edge cases', () => {
            test_removeVersionFromCanonical("|1.0.0", "");
            test_removeVersionFromCanonical("test|", "test");
            test_removeVersionFromCanonical("", "");
            test_removeVersionFromCanonical(null, null);
        });
    });

    describe('compareVersions', () => {
        test('should handle equal versions', () => {
            test_compareVersions("1.0.0", "1.0.0", 0);
            test_compareVersions("2.1.5", "2.1.5", 0);
            test_compareVersions("r4", "r4", 0);
            test_compareVersions("R5", "r5", 0);
        });

        test('should handle first version later', () => {
            test_compareVersions("1.0.1", "1.0.0", 1);
            test_compareVersions("1.1.0", "1.0.0", 1);
            test_compareVersions("2.0.0", "1.0.0", 1);
            test_compareVersions("r5", "r4", 1);
            test_compareVersions("2.1.0", "2.0.5", 1);
        });

        test('should handle second version later', () => {
            test_compareVersions("1.0.0", "1.0.1", -1);
            test_compareVersions("1.0.0", "1.1.0", -1);
            test_compareVersions("1.0.0", "2.0.0", -1);
            test_compareVersions("r4", "r5", -1);
            test_compareVersions("2.0.5", "2.1.0", -1);
        });

        test('should handle prerelease versions', () => {
            test_compareVersions("1.0.0", "1.0.0-alpha", 1);
            test_compareVersions("1.0.0-alpha", "1.0.0-beta", -1);
            test_compareVersions("1.0.0-beta", "1.0.0-alpha", 1);
        });
    });

    describe('versionHasWildcards', () => {
        test('should return false for null and empty inputs', () => {
            expect(VersionUtilities.versionHasWildcards(null)).toBe(false);
            expect(VersionUtilities.versionHasWildcards("")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("   ")).toBe(false);
        });

        test('should return false for regular semver versions', () => {
            expect(VersionUtilities.versionHasWildcards("1.0.0")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("2.1.5")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("10.20.30")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-alpha")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+build")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-alpha+build")).toBe(false);
        });

        test('should return true for question mark suffix wildcard', () => {
            expect(VersionUtilities.versionHasWildcards("1.0?")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("2.1.0?")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-alpha?")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0+build?")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("?")).toBe(true);
        });

        test('should return true for asterisk wildcard anywhere', () => {
            expect(VersionUtilities.versionHasWildcards("*.0.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.*.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("*.*.*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-alpha*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-*alpha")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0+*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0+build*")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0+*build")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("*")).toBe(true);
        });

        test('should return true for x/X wildcards in version parts', () => {
            expect(VersionUtilities.versionHasWildcards("x.0.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.x.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.x")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("x.x.x")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("X.0.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.X.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.X")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("X.X.X")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("x.X.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("X.x.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("x")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("X")).toBe(true);
        });

        test('should return false for x/X in release labels', () => {
            expect(VersionUtilities.versionHasWildcards("1.0.0-x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-X")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-alpha-x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-x-alpha")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-prex")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-xpost")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-preX")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-Xpost")).toBe(false);
        });

        test('should return false for x/X in build labels', () => {
            expect(VersionUtilities.versionHasWildcards("1.0.0+x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+X")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+build-x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+x-build")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+prebuildx")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+xpostbuild")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+prebuildX")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0+Xpostbuild")).toBe(false);
        });

        test('should handle complex cases with both release and build labels', () => {
            expect(VersionUtilities.versionHasWildcards("x.0.0-alpha+build")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.x.0-alpha+build")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.X-alpha+build")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-x+X")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0-X+x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("*.0.0-x+X")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0-x+X?")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("x.0.0-*+build")).toBe(true);
        });

        test('should handle edge cases', () => {
            expect(VersionUtilities.versionHasWildcards("-")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("+")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("-+")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("+-")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("*-")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("*+")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("x-")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("X+")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.x.0.0")).toBe(true);
            expect(VersionUtilities.versionHasWildcards("1.0.0.0-x")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.0.0?-alpha")).toBe(false);
            expect(VersionUtilities.versionHasWildcards("1.?0.0")).toBe(false);
        });
    });

    // added 1/1/2026 when migrating from pascal
    describe('versionMatches - strict part presence', () => {
        test('should require same structure (no implicit .0)', () => {
            // Two-part vs three-part
            test_versionMatches("2.0", "2.0.0", false);
            test_versionMatches("2.0.0", "2.0", false);
            test_versionMatches("1.5", "1.5.0", false);
            test_versionMatches("1.5.0", "1.5", false);

            // With different values
            test_versionMatches("2.0", "2.0.1", false);
            test_versionMatches("2.1", "2.1.5", false);
        });

        test('should match when structure is identical', () => {
            test_versionMatches("2.0", "2.0", true);
            test_versionMatches("2.0.0", "2.0.0", true);
            test_versionMatches("1.5.3", "1.5.3", true);
        });
    });

    describe('versionMatches - minor wildcard with/without patch', () => {
        test('2.* should only match two-part versions', () => {
            test_versionMatches("2.*", "2.0", true);
            test_versionMatches("2.*", "2.1", true);
            test_versionMatches("2.*", "2.99", true);
            test_versionMatches("2.*", "2.0.0", false);  // Three parts = no match
            test_versionMatches("2.*", "2.1.0", false);
            test_versionMatches("2.*", "2.0-alpha", false); // Has prerelease
        });

        test('2.x.x should only match three-part versions without labels', () => {
            test_versionMatches("2.x.x", "2.0.0", true);
            test_versionMatches("2.x.x", "2.1.5", true);
            test_versionMatches("2.x.x", "2.99.99", true);
            test_versionMatches("2.x.x", "2.0", false);     // Two parts = no match
            test_versionMatches("2.x.x", "2.1", false);
            test_versionMatches("2.x.x", "2.0.0-alpha", false); // Has prerelease
            test_versionMatches("2.x.x", "2.0.0+build", false); // Has build
        });
    });

    describe('versionMatches - patch wildcard', () => {
        test('2.0.* should match three-part versions without labels', () => {
            test_versionMatches("2.0.*", "2.0.0", true);
            test_versionMatches("2.0.*", "2.0.1", true);
            test_versionMatches("2.0.*", "2.0.99", true);
            test_versionMatches("2.0.*", "2.0", false);         // Two parts = no match
            test_versionMatches("2.0.*", "2.0.0-alpha", false); // Has prerelease
            test_versionMatches("2.0.*", "2.0.0+build", false); // Has build
            test_versionMatches("2.0.*", "2.1.0", false);       // Wrong minor
        });
    });

    describe('versionMatches - prerelease wildcard (-*)', () => {
        test('should match only versions with prerelease and no build', () => {
            test_versionMatches("2.0.0-*", "2.0.0-alpha", true);
            test_versionMatches("2.0.0-*", "2.0.0-beta", true);
            test_versionMatches("2.0.0-*", "2.0.0-rc.1", true);
            test_versionMatches("2.0.0-*", "2.0.0-alpha.beta.1", true);
            test_versionMatches("2.0.0-*", "2.0.0", false);           // No prerelease
            test_versionMatches("2.0.0-*", "2.0.0+build", false);     // Build only
            test_versionMatches("2.0.0-*", "2.0.0-alpha+build", false); // Has build too
            test_versionMatches("2.0.0-*", "2.0.1-alpha", false);     // Wrong patch
        });
    });

    describe('versionMatches - build wildcard (+*)', () => {
        test('should match only versions with build and no prerelease', () => {
            test_versionMatches("2.0.0+*", "2.0.0+build", true);
            test_versionMatches("2.0.0+*", "2.0.0+123", true);
            test_versionMatches("2.0.0+*", "2.0.0+build.456", true);
            test_versionMatches("2.0.0+*", "2.0.0", false);           // No build
            test_versionMatches("2.0.0+*", "2.0.0-alpha", false);     // Prerelease only
            test_versionMatches("2.0.0+*", "2.0.0-alpha+build", false); // Has prerelease too
            test_versionMatches("2.0.0+*", "2.0.1+build", false);     // Wrong patch
        });
    });

    describe('versionMatches - x/X in labels should NOT be wildcards', () => {
        test('x/X in prerelease should match literally', () => {
            test_versionMatches("2.0.0-x", "2.0.0-x", true);
            test_versionMatches("2.0.0-x", "2.0.0-y", false);
            test_versionMatches("2.0.0-x", "2.0.0-alpha", false);
            test_versionMatches("2.0.0-X", "2.0.0-X", true);
            test_versionMatches("2.0.0-X", "2.0.0-Y", false);
        });

        test('x/X in build should match literally', () => {
            test_versionMatches("2.0.0+x", "2.0.0+x", true);
            test_versionMatches("2.0.0+x", "2.0.0+y", false);
            test_versionMatches("2.0.0+X", "2.0.0+X", true);
            test_versionMatches("2.0.0+X", "2.0.0+Y", false);
        });
    });

    describe('versionMatches - combined wildcards', () => {
        test('should handle multiple wildcard types', () => {
            test_versionMatches("2.*.x", "2.0.0", true);  // Both minor and patch wild
            test_versionMatches("2.*.x", "2.5.9", true);
            test_versionMatches("2.*.x", "2.0", false);   // Missing patch
            test_versionMatches("*.*.x", "1.2.3", true);  // All version parts wild
            test_versionMatches("*.*.x", "99.99.0", true);
        });
    });

    // Helper methods
    function test_isSemVer(version, expected) {
        expect(VersionUtilities.isSemVer(version)).toBe(expected);
    }

    function test_isThisOrLaterMajorMinor(test, current, expected) {
        expect(VersionUtilities.isThisOrLater(test, current, VersionPrecision.MINOR)).toBe(expected);
    }

    function test_isThisOrLater(test, current, expected) {
        expect(VersionUtilities.isThisOrLater(test, current, VersionPrecision.FULL)).toBe(expected);
    }

    function test_getMajMin(input, expected) {
        expect(VersionUtilities.getMajMin(input)).toBe(expected);
    }

    function test_getMajMinPatch(input, expected) {
        expect(VersionUtilities.getMajMinPatch(input)).toBe(expected);
    }

    function test_getPatch(input, expected) {
        expect(VersionUtilities.getPatch(input)).toBe(expected);
    }

    function test_incMajorVersion(input, expected) {
        expect(VersionUtilities.incMajorVersion(input)).toBe(expected);
    }

    function test_incMinorVersion(input, expected) {
        expect(VersionUtilities.incMinorVersion(input)).toBe(expected);
    }

    function test_incPatchVersion(input, expected) {
        expect(VersionUtilities.incPatchVersion(input)).toBe(expected);
    }

    function test_versionMatches(criteria, candidate, expected) {
        expect(VersionUtilities.versionMatches(criteria, candidate)).toBe(expected);
    }

    function test_isR4Plus(version, expected) {
        expect(VersionUtilities.isR4Plus(version)).toBe(expected);
    }

    function test_isR5Plus(version, expected) {
        expect(VersionUtilities.isR5Plus(version)).toBe(expected);
    }

    function test_isR6Plus(version, expected) {
        expect(VersionUtilities.isR6Plus(version)).toBe(expected);
    }

    function test_removeVersionFromCanonical(input, expected) {
        expect(VersionUtilities.removeVersionFromCanonical(input)).toBe(expected);
    }

    function test_compareVersions(ver1, ver2, expected) {
        expect(VersionUtilities.compareVersions(ver1, ver2)).toBe(expected);
    }

    describe('compareVersionsGeneral', () => {

        // Basic sanity - same format comparisons
        test('should compare semver versions correctly', () => {
            expect(VersionUtilities.compareVersionsGeneral("1.0.0", "2.0.0")).toBe(-1);
            expect(VersionUtilities.compareVersionsGeneral("2.0.0", "1.0.0")).toBe(1);
            expect(VersionUtilities.compareVersionsGeneral("1.0.0", "1.0.0")).toBe(0);
            expect(VersionUtilities.compareVersionsGeneral("1.0.0", "1.0.1")).toBe(-1);
            expect(VersionUtilities.compareVersionsGeneral("1.1.0", "1.0.9")).toBe(1);
        });

        test('should compare integer versions correctly', () => {
            expect(VersionUtilities.compareVersionsGeneral("1", "2")).toBe(-1);
            expect(VersionUtilities.compareVersionsGeneral("2", "1")).toBe(1);
            expect(VersionUtilities.compareVersionsGeneral("5", "5")).toBe(0);
            expect(VersionUtilities.compareVersionsGeneral("9", "10")).toBeLessThan(0);
            expect(VersionUtilities.compareVersionsGeneral("10", "9")).toBeGreaterThan(0);
        });

        test('should compare date versions correctly', () => {
            expect(VersionUtilities.compareVersionsGeneral("2024-01-01", "2024-06-15")).toBe(-1);
            expect(VersionUtilities.compareVersionsGeneral("2024-06-15", "2024-01-01")).toBe(1);
            expect(VersionUtilities.compareVersionsGeneral("2024-01-01", "2024-01-01")).toBe(0);
        });

        test('should compare alpha versions correctly', () => {
            expect(VersionUtilities.compareVersionsGeneral("abc", "def")).toBeLessThan(0);
            expect(VersionUtilities.compareVersionsGeneral("def", "abc")).toBeGreaterThan(0);
            expect(VersionUtilities.compareVersionsGeneral("abc", "abc")).toBe(0);
        });

        // Bug: date normalisation can make different strings equal, but code returns -1
        test('should return 0 for equivalent date formats', () => {
            expect(VersionUtilities.compareVersionsGeneral("2024-01", "202401")).toBe(0);
            expect(VersionUtilities.compareVersionsGeneral("2024-01-15", "20240115")).toBe(0);
        });

        // Bug: null/undefined asymmetry — version present vs absent
        // A real version should arguably sort AFTER null (i.e., null is "less")
        test('should handle null/undefined versions consistently', () => {
            const v1null = VersionUtilities.compareVersionsGeneral(null, "1.0.0");
            const v2null = VersionUtilities.compareVersionsGeneral("1.0.0", null);
            // At minimum these should be opposite signs
            expect(Math.sign(v1null)).toBe(-Math.sign(v2null));
            expect(VersionUtilities.compareVersionsGeneral(null, null)).toBe(0);
            expect(VersionUtilities.compareVersionsGeneral(undefined, undefined)).toBe(0);
        });

        // Bug: format guessed from version1 only — mismatched formats
        test('should handle mismatched version formats', () => {
            // semver vs integer
            const r1 = VersionUtilities.compareVersionsGeneral("1.0.0", "2");
            const r2 = VersionUtilities.compareVersionsGeneral("2", "1.0.0");
            expect(Math.sign(r1)).toBe(-Math.sign(r2));

            // semver vs date
            const r3 = VersionUtilities.compareVersionsGeneral("1.0.0", "2024-01-01");
            const r4 = VersionUtilities.compareVersionsGeneral("2024-01-01", "1.0.0");
            expect(Math.sign(r3)).toBe(-Math.sign(r4));

            // date vs integer
            const r5 = VersionUtilities.compareVersionsGeneral("2024-01-01", "5");
            const r6 = VersionUtilities.compareVersionsGeneral("5", "2024-01-01");
            expect(Math.sign(r5)).toBe(-Math.sign(r6));
        });

        // Bug: semver equal-after-normalization but not string-equal
        test('should handle semver versions that differ only in part count', () => {
            // "1.0" and "1.0.0" are not string-equal, so the == guard won't catch them
            const r1 = VersionUtilities.compareVersionsGeneral("1.0", "1.0.0");
            const r2 = VersionUtilities.compareVersionsGeneral("1.0.0", "1.0");
            // Should be 0 or at least antisymmetric
            expect(Math.sign(r1)).toBe(-Math.sign(r2));
        });

        // Symmetry: compare(a,b) should always be -compare(b,a)
        test('should be antisymmetric', () => {
            const pairs = [
                ["1.0.0", "2.0.0"],
                ["2024-01-01", "2025-06-15"],
                ["3", "7"],
                ["alpha", "beta"],
                ["1.0.0-alpha", "1.0.0"],
            ];
            for (const [a, b] of pairs) {
                const ab = VersionUtilities.compareVersionsGeneral(a, b);
                const ba = VersionUtilities.compareVersionsGeneral(b, a);
                if ((ab == 0)) {
                    expect(ba).toBe(0);
                } else {
                    expect(Math.sign(ab)).toBe(-Math.sign(ba));
                }
            }
        });
    });
});